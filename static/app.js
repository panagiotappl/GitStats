$(document).ajaxStart(function() {
    $('#general').hide();
    spinner.spin(target);
});
$(document).ajaxStop(function() {
    spinner.stop();
});
$('#analyzeForm').on('submit', function(e) {
    e.preventDefault();

    $.ajax({
        url: '/analyze',
        method: 'POST',
        dataType: 'json',
        data: {
            path: $('#path').val()
        },
        success: function (response) {
            console.log(response)


        }
    });
});
