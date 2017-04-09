import os
import sys
import re
import subprocess
from datetime import datetime
from itertools import izip


class Analyzer:
    def __init__(self):
        self.statistics = dict()

    def execute_command(self, command):
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout
        result = process.readlines()
        process.close()
        return result

    def grouped(self, iterable, n):
        "s -> (s0,s1,s2,...sn-1), (sn,sn+1,sn+2,...s2n-1), (s2n,s2n+1,s2n+2,...s3n-1), ..."
        return izip(*[iter(iterable)] * n)

    def repo_name(self):
        results = self.execute_command("git rev-parse --show-toplevel")
        return results[0]

    def number_of_files(self):
        results = self.execute_command("git ls-files")
        return len(results)

    def number_of_lines(self):
        """
        Returns lines count.
    
        :return: returns number of lines of git-included files
        """
        # xargs to uild and execute wc from standard input.
        results = self.execute_command("git diff --stat 4b825dc642cb6eb9a060e54bf8d69288fbee4904")
        lines = 0
        for file in results:
            t = int(re.findall(" /|\s+(\d+)\s+", file)[0])
            lines += t
        return lines

    def committer_stats(self):
        """
        Generates and prints commiter's stats.
        """
        com_stats = dict()
        results = self.execute_command("git log --all --format='%aN'")
        results = map(str.strip, results)
        results.sort()
        results = set(results)

        commiters = []
        for commiter in results:
            commiters.append(commiter.decode("utf-8", "replace").strip())

        com_stats["committers"] = len(commiters)
        # Number of commits
        # result = execute_command("git shortlog --all | grep -E '^[ ]+\w+' | wc -l")
        result = self.execute_command(" git shortlog --all -s")
        commits = 0
        for author in result:
            commits += int(re.findall("\s(\d+)\t", author)[0])

        com_stats["commits"] = commits

        com_adds = {}
        com_dels = {}
        com_changes = {}
        # Number of insertions/deletions per committer
        for j in range(0, len(commiters)):
            results = self.execute_command('git log --all --author="' + commiters[j] + '" --oneline --shortstat')
            lines_added = 0
            lines_moddified = 0
            lines_removed = 0
            for res in results:
                am, dm = re.search(r'\d+(?= insertions)', res), re.search(r'\d+(?= deletions)', res)
                MOD_PATTERN = '^.+(\[-|\{\+).*$'
                ADD_PATTERN = '^\{\+.*\+\}$'
                REM_PATTERN = '^\[-.*-\]$'

                if not (am and dm):
                    commit = res.split(' ')[0]
                if am or dm:
                    dif = self.execute_command("git diff --word-diff --unified=0 " + commit + " " + commit + "~1")
                    for line in dif:
                        addsMatch = re.findall(ADD_PATTERN, line)
                        changesMatch = re.findall(MOD_PATTERN, line)
                        removedMatch = re.findall(REM_PATTERN, line)

                        if addsMatch:
                            lines_added += len(addsMatch)
                        if changesMatch:
                            lines_moddified += len(changesMatch)
                        if removedMatch:
                            lines_removed += len(removedMatch)

            com_adds[commiters[j]] = lines_added
            com_dels[commiters[j]] = lines_removed
            com_changes[commiters[j]] = lines_moddified
        com_stats["adds"] = com_adds
        com_stats["dels"] = com_dels
        com_stats["changes"] = com_changes

        # Percentage of commits per author.
        results = self.execute_command("git shortlog -sn --all")

        commits_per_author = dict()
        for author in results:
            if len(author.strip().split('\t', 1)) is 2:
                commits_per_author[author.strip().split('\t', 1)[1]] = author.strip().split('\t', 1)[0]

        for author in commits_per_author:
            commits_per_author[author] = round(float(commits_per_author[author]) / float(commits) * 100, 2)

        com_stats["com_per_author"] = commits_per_author
        for i in commits_per_author:
            percentage = float(commits_per_author[i]) / float(commits) * 100
            # Print readable percentage per author.

        return com_stats

    def branch_stats(self):
        """
        Generates and prints branches stats.
        """

        br_stats = dict()

        # Number of tags
        tags = self.execute_command("git tag")
        br_stats["tags"] = len(tags)
        # Number of branches (local).
        localB = self.execute_command("git branch")

        # Number of branches (remote).
        remoteB = self.execute_command("git branch -r")

        br_stats["localCount"] = len(localB)
        br_stats["remoteCount"] = len(remoteB)
        br_stats["localB"] = localB
        br_stats["remoteB"] = remoteB[1:]
        br_stats['branch_dates_remote'] = {}
        br_stats['branch_dates_local'] = {}
        br_stats['branch_stats_local'] = {}
        br_stats['branch_stats_remote'] = {}

        com_branchR = dict()
        # Number of commits per branch (remote).
        # Ignore first element (HEAD pointer).
        for i in range(1, len(remoteB)):
            result = self.execute_command("git rev-list --count" + remoteB[i])
            com_branchR[remoteB[i].strip()] = int(result[0])
            # Also get branch dates
            res = self.execute_command("git log --pretty='%cd' " + remoteB[i])
            first = self.execute_command("git show-branch --sha1 master " + remoteB[i])
            first_commit = first[-1]
            first_sha1 = re.findall(r'\[([^]]*)\]', first_commit)[0]
            date = self.execute_command("git show -s --format=%ci " + first_sha1)[0]
            if res:
                if len(first) is 1:
                    date = res[-1]
                br_stats['branch_dates_remote'][remoteB[i].strip()] = [date, res[0]]
            else:
                br_stats['branch_dates_remote'][remoteB[i].strip()] = [0, 0]
            # Also get branches logs
            res = self.execute_command(
                'git log ' + remoteB[i].strip() + ' --pretty="tformat:\"%h@@@%ad@@@%s%d@@@%an\"" --date=short')
            br_stats['branch_stats_remote'][remoteB[i].strip()] = []
            for commit in res:
                commit = commit[1:].strip()
                data = commit.split("@@@")
                br_stats['branch_stats_remote'][remoteB[i].strip()].append(
                    {
                        'id': data[0],
                        'message': data[2],
                        'date': data[1],
                        'author': data[3].strip()

                    }
                )

        br_stats["tagsR"] = {}

        # for branch in remoteB[1:]:
        #     br_stats["tagsR"][branch.strip] = []



        br_stats["com_branchR"] = com_branchR

        com_branchL = dict()
        # Number of commits per branch (local)
        for i in range(0, len(localB)):
            # Remove star character for edited local branches
            result = self.execute_command("git rev-list --count " + localB[i].strip('* '))
            com_branchL[localB[i].strip()] = int(result[0])
            # Also get branch dates
            res = self.execute_command("git log --pretty='%cd' " + localB[i].strip('* '))
            first = self.execute_command("git show-branch --sha1 master " + localB[i].strip('* '))
            first_commit = first[-1]
            first_sha1 = re.findall(r'\[([^]]*)\]', first_commit)[0]
            date = self.execute_command("git show -s --format=%ci " + first_sha1)[0]
            if res:
                if len(first) is 1:
                    date = res[-1]
                br_stats['branch_dates_local'][localB[i].strip('* \n')] = [date, res[0]]
            else:
                br_stats['branch_dates_local'][localB[i].strip('* \n')] = [0, 0]
            # Also get branches logs
            res = self.execute_command(
                'git log ' + localB[i].strip('* \n') + ' --pretty="tformat:\"%h@@@%ad@@@%s%d@@@%an\"" --date=short')
            br_stats['branch_stats_local'][localB[i].strip('* \n')] = []
            for commit in res:
                commit = commit[1:].strip()
                data = commit.split("@@@")
                br_stats['branch_stats_local'][localB[i].strip('* \n')].append(
                    {
                        'id': data[0],
                        'message': data[2],
                        'date': data[1],
                        'author': data[3].strip()

                    }
                )

        for branch in localB:
            br_stats["tagsR"][branch.strip("* \n")] = []
        tags = self.execute_command("git tag")
        for tag in tags:
            res = self.execute_command("git branch --contains tags/" + tag.strip())
            for branch in res:
                br_stats["tagsR"][branch.strip("* \n")].append(tag.strip())

        br_stats["com_branchL"] = com_branchL

        com_br_authR = dict()
        # Commit percentage per branch per author (remote)
        # Ignore first element (HEAD pointer).
        for branch in remoteB[1:]:
            branch = branch.strip('* ')
            branch_total_commits = self.execute_command("git rev-list --count " + branch)[0].strip()
            result = self.execute_command("git shortlog -sn " + branch)
            com_br_authR[branch.strip()] = []
            for res in result:
                if len(res.split('\t', 1)) is 2:
                    commits = res.split('\t', 1)[0]
                    name = res.split('\t', 1)[1]
                    percentage = round(float(commits) / float(branch_total_commits) * 100, 2)
                    com_br_authR[branch.strip()].append([name, percentage])

        br_stats["com_br_authR"] = com_br_authR

        com_br_authL = dict()
        # Commit percentage per branch per author (local)
        # Ignore first element (HEAD pointer).
        for branch in localB:
            branch = branch.strip('* ')
            branch_total_commits = self.execute_command("git rev-list --count " + branch)[0].strip()
            result = self.execute_command("git shortlog -sn " + branch)
            com_br_authL[branch.strip()] = []
            for res in result:
                if len(res.split('\t', 1)) is 2:
                    commits = res.split('\t', 1)[0]
                    name = res.split('\t', 1)[1]
                    percentage = round(float(commits) / float(branch_total_commits) * 100, 2)
                    com_br_authL[branch.strip()].append([name, percentage])

        br_stats["com_br_authL"] = com_br_authL

        com_rates = dict()
        # Get mean commit's rate per day, week and month
        # Find earliest commit.
        earliest_commit = self.execute_command("git rev-list --max-parents=0 HEAD")
        earliest_commit = self.execute_command("git show -s --format=%ci " + earliest_commit[0].strip())[0].strip()

        # Calculate days since then.
        date_format = "%Y-%m-%d"
        first_commit_date = datetime.strptime(earliest_commit.split(" ")[0], date_format)
        today = datetime.now()

        days = today - first_commit_date
        days = days.days

        results = self.execute_command("git shortlog -sn --all")

        for res in results:
            res = res.strip()
            res = res.split('\t')
            if len(res) is 2:
                commits = res[0]
                name = res[1]
                com_rates[name] = [round(float(commits) / float(days), 3), round(float(commits) / float(days) * 7, 3),
                                   round(float(commits) / float(days) * 30, 3)]
                # A week is 7 days.
                # A month is 30.

        br_stats["com_rates"] = com_rates
        print com_rates
        # Percentage of commits per branch.
        # Get all the commits from all branches
        br_stats["branchCommits"] = {}
        commits_count = len(self.execute_command("git rev-list --remotes"))
        for branch in localB:
            branch = branch.strip('* ').strip()
            branch_commits_count = len(self.execute_command("git log --pretty=format:\"%h\" " + branch))
            br_stats["branchCommits"][branch] = str(round(float(branch_commits_count) / float(commits_count) * 100, 2))

        br_stats["branchCommitsR"] = {}

        for branch in remoteB:
            branch = branch.strip('* ').strip()
            if re.search('origin/HEAD -> ', branch, re.IGNORECASE):
                continue

            branch_commits_count = len(self.execute_command("git log --pretty=format:\"%h\" " + branch))
            br_stats["branchCommitsR"][branch] = str(round(float(branch_commits_count) / float(commits_count) * 100, 2))
        return br_stats

    def check_validation(self, repo_path):
        not_valid = False

        if os.path.isdir(repo_path):
            not_valid = True;
            os.chdir(repo_path)
            result = self.execute_command("git rev-parse --is-inside-work-tree")
            if len(result) == 0 or result[0].strip('\n') != "true":
                not_valid = False

        return not_valid

    def analyze(self, repo_path):
        print self.check_validation(repo_path)
        if self.check_validation(repo_path):



            self.statistics["gitname"] = self.repo_name()

            self.statistics["file_count"] = self.number_of_files()

            self.statistics["line_count_total"] = self.number_of_lines()

            self.statistics["com_stats"] = self.committer_stats()

            self.statistics["br_stats"] = self.branch_stats()

            return self.statistics
        else:
            return {}
