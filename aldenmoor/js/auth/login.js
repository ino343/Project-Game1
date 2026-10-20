/**
 * Login page: one form that switches between "Log in" and "Create account".
 */
Store.ready.then(() => {
  'use strict';

  if (Store.Session.getUser()) {
    location.replace('characters.html');
    return;
  }

  const form = $('#authForm');
  const username = $('#username');
  const email = $('#email');
  const userRow = $('#userRow');
  const password = $('#password');
  const confirm = $('#confirm');
  const confirmRow = $('#confirmRow');
  const submit = $('#authSubmit');
  const msg = $('#authMsg');
  const tabs = [...document.querySelectorAll('.tab')];
  let mode = 'login';

  function showMessage(text, ok) {
    msg.classList.toggle('ok', !!ok);
    msg.textContent = text;
    msg.hidden = !text;
  }

  function setMode(next) {
    mode = next;
    for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.mode === next));
    const register = next === 'register';
    confirmRow.hidden = !register;
    userRow.hidden = !register;
    username.required = register;
    $('#emailHelp').hidden = !register;
    confirm.required = register;
    password.autocomplete = register ? 'new-password' : 'current-password';
    submit.textContent = register ? 'Create account' : 'Log in';
    $('#authTitle').textContent = register ? 'Begin your legend' : 'Welcome back';
    $('#authSub').textContent = register
      ? 'Create an account to start your adventure.'
      : 'Log in to continue your adventure.';
    $('#userHelp').hidden = $('#passHelp').hidden = !register;
    username.placeholder = 'Choose a username';
    email.placeholder = register ? 'you@example.com' : 'The email you signed up with';
    password.placeholder = register ? 'Choose a password' : 'Your password';
    showMessage('');
  }

  for (const t of tabs) t.addEventListener('click', () => setMode(t.dataset.mode));

  const showPass = $('#showPass');
  showPass.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = confirm.type = show ? 'text' : 'password';
    showPass.textContent = show ? 'Hide' : 'Show';
    showPass.setAttribute('aria-pressed', String(show));
    showPass.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage('');
    if (mode === 'register' && password.value !== confirm.value)
      return showMessage('Passwords do not match.');
    submit.disabled = true;
    try {
      const res =
        mode === 'register'
          ? await Store.Accounts.register(username.value, email.value, password.value)
          : await Store.Accounts.login(email.value, password.value);
      if (res.ok) location.replace('characters.html');
      else if (res.info) {
        // Account created, waiting for the e-mail confirmation: go to the log in tab.
        const mail = res.email;
        password.value = confirm.value = '';
        setMode('login');
        email.value = mail;
        showMessage(res.error, true);
      } else showMessage(res.error);
    } catch (err) {
      showMessage('Something went wrong. Please try again.');
    } finally {
      submit.disabled = false;
    }
  });

  setMode('login');
  if (!Store.configured) showMessage('Supabase is not set up yet: paste your Project URL and anon key in js/shared/supabase-config.js.');
  else if (Store.loadError) showMessage(Store.loadError);
  email.focus();
  MenuMusic.start();
});
