$(document).ready(function () {
    $('#employeesTable').DataTable({
        ajax: {
            url: 'MOCK_DATA.json',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'first_name' },
            { data: 'last_name' },
            { data: 'email' },
            { data: 'department' },
            {
                data: 'salary',
                render: function (data, type) {
                    if (type === 'display' || type === 'filter') {
                        return '$' + Number(data).toLocaleString();
                    }
                    return data;
                }
            }
        ],
        pageLength: 10,
        order: [[0, 'asc']]
    });
});
