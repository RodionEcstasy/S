let currentPage = 1;
const itemsPerPage = 10;

async function loadUsers() {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/admin/users?page=${currentPage}&limit=${itemsPerPage}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  renderUsers(data.users);
  renderPagination(data.total);
}

function renderUsers(users) {
  const tbody = document.querySelector('#users-table tbody');
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td>
        <button onclick="banUser(${user.id})" ${user.is_banned ? 'disabled' : ''}>
          ${user.is_banned ? 'Banned' : 'Ban'}
        </button>
      </td>
    </tr>
  `).join('');
}
