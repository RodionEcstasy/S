document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: e.target.username.value,
      email: e.target.email.value,
      password: e.target.password.value
    })
  });
  
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);
    window.location.href = '/profile.html';
  } else {
    alert(data.error || 'Registration failed');
  }
});