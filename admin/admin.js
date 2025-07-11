document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#registrationsTable tbody');
    const exportCsvButton = document.getElementById('exportCsv');

    let registrationsData = [];

    const loadRegistrations = async () => {
        try {
            const response = await fetch('/admin/registrations');
            registrationsData = await response.json();
            renderTable(registrationsData);
        } catch (error) {
            console.error('Error loading registrations:', error);
        }
    };

    const renderTable = (data) => {
        tableBody.innerHTML = '';
        data.forEach(reg => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${reg.id}</td>
                <td>${reg.team_name}</td>
                <td>${reg.captain_name}</td>
                <td>${reg.captain_email}</td>
                <td>${reg.captain_phone}</td>
                <td>${reg.players_count}</td>
                <td>${reg.payment_reference}</td>
                <td>${reg.is_paid ? 'Da' : 'Ne'}</td>
                <td>${new Date(reg.created_at).toLocaleString('sl-SI')}</td>
                <td>
                    <button class="paid-button" data-id="${reg.id}" ${reg.is_paid ? 'disabled' : ''}>
                        Označi kot plačano
                    </button>
                </td>
            `;
        });
    };

    tableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('paid-button')) {
            const id = e.target.dataset.id;
            try {
                const response = await fetch(`/admin/registrations/${id}/pay`, { method: 'PUT' });
                if (response.ok) {
                    loadRegistrations(); // Refresh the table
                } else {
                    alert('Failed to mark as paid.');
                }
            } catch (error) {
                console.error('Error marking as paid:', error);
            }
        }
    });

    exportCsvButton.addEventListener('click', () => {
        if (registrationsData.length === 0) return;

        const headers = ['ID', 'Ime ekipe', 'Kapetan', 'Email', 'Telefon', 'Št. igralcev', 'Referenca', 'Plačano', 'Datum prijave'];
        const csvContent = [
            headers.join(','),
            ...registrationsData.map(row => [
                row.id,
                `"${row.team_name}"`,
                `"${row.captain_name}"`,
                row.captain_email,
                row.captain_phone,
                row.players_count,
                row.payment_reference,
                row.is_paid ? 'Da' : 'Ne',
                new Date(row.created_at).toLocaleString('sl-SI')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'prijave.csv';
        link.click();
    });

    loadRegistrations();
});
