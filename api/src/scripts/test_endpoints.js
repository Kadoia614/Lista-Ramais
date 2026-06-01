const base = process.env.BASE ?? 'http://127.0.0.1:3000/api';
const email = process.env.TEST_EMAIL ?? 'test@example.com';
const password = process.env.TEST_PASSWORD ?? 'password123';
const tempPassword = process.env.TEMP_PASSWORD ?? `${password}-temp`;

async function waitForHealth(retries = 20, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) return true;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
}

async function run() {
  console.log('Waiting for server...');
  const up = await waitForHealth();
  if (!up) {
    console.error('Server did not become healthy in time');
    process.exit(2);
  }

  console.log('Server healthy — testing bootstrap');
  const bootstrapRes = await fetch(`${base}/auth/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (![200, 201, 409].includes(bootstrapRes.status)) {
    console.error('Bootstrap failed', await bootstrapRes.text());
    process.exit(3);
  }

  let token;
  if (bootstrapRes.status === 409) {
    // already exists — proceed to login to obtain token
    console.log('Bootstrap skipped: admin already exists');
  } else {
    const bootstrapBody = await bootstrapRes.json();
    token = bootstrapBody.token;
    if (!token) {
      console.error('No token returned from bootstrap');
      process.exit(4);
    }
  }

  console.log('Bootstrap OK — testing login');
  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (loginRes.status !== 200) {
    console.error('Login failed', await loginRes.text());
    process.exit(5);
  }

  const loginBody = await loginRes.json();
  const loginToken = loginBody.token;
  if (!loginToken) {
    console.error('No token returned from login');
    process.exit(6);
  }

  console.log('Login OK — testing public ramais endpoint');
  const publicRes = await fetch(`${base}/public/ramais`);
  if (publicRes.status !== 200) {
    console.error('Public ramais failed', await publicRes.text());
    process.exit(7);
  }

  console.log('Public ramais OK — testing protected ramais CRUD');
  const uniqueRamal = `test-${Date.now()}`;
  const createRes = await fetch(`${base}/ramais`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginToken}`,
    },
    body: JSON.stringify({ nome: 'Teste', setor: 'TI', ramal: uniqueRamal }),
  });

  if (createRes.status !== 201) {
    console.error('Create ramal failed', await createRes.text());
    process.exit(8);
  }

  const created = await createRes.json();
  const id = created.id;
  console.log('Created ramal id=', id);

  const listRes = await fetch(`${base}/ramais`, {
    headers: { Authorization: `Bearer ${loginToken}` },
  });
  if (listRes.status !== 200) {
    console.error('List ramais failed', await listRes.text());
    process.exit(9);
  }

  const list = await listRes.json();
  if (!Array.isArray(list.data) || list.data.length === 0 || !list.pagination) {
    console.error('List ramais unexpected result', list);
    process.exit(10);
  }

  console.log('List ramais OK — deleting created ramal');
  const delRes = await fetch(`${base}/ramais/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${loginToken}` },
  });

  if (![200,204].includes(delRes.status)) {
    console.error('Delete ramal failed', await delRes.text());
    process.exit(11);
  }

  console.log('Testing password change endpoint');
  const changeLoginRes = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const changeLoginBody = await changeLoginRes.json();
  if (!changeLoginRes.ok) {
    console.error('Login for password-change test failed', changeLoginBody);
    process.exit(12);
  }

  const changePasswordRes = await fetch(`${base}/users/me/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${changeLoginBody.token}`,
    },
    body: JSON.stringify({ currentPassword: password, newPassword: tempPassword }),
  });

  if (changePasswordRes.status !== 200) {
    console.error('Change password failed', await changePasswordRes.text());
    process.exit(13);
  }

  const oldPasswordLogin = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (oldPasswordLogin.status !== 401) {
    console.error('Old password should no longer work', await oldPasswordLogin.text());
    process.exit(14);
  }

  const newPasswordLogin = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: tempPassword }),
  });

  if (newPasswordLogin.status !== 200) {
    console.error('New password login failed', await newPasswordLogin.text());
    process.exit(15);
  }

  const restoreLoginBody = await newPasswordLogin.json();
  const restorePasswordRes = await fetch(`${base}/users/me/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${restoreLoginBody.token}`,
    },
    body: JSON.stringify({ currentPassword: tempPassword, newPassword: password }),
  });

  if (restorePasswordRes.status !== 200) {
    console.error('Restoring original password failed', await restorePasswordRes.text());
    process.exit(16);
  }

  console.log('Protected ramais CRUD OK');
  console.log('All tests passed');
  process.exit(0);
}

run().catch((err) => {
  console.error('Unexpected error', err);
  process.exit(99);
});
