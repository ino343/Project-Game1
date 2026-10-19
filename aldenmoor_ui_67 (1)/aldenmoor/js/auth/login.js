/**
 * Login page: one form that switches between "Log in" and "Create account".
 */
(() => {
  'use strict';

  if (Store.Session.getUser()) {
    location.replace('characters.html');
    return;
  }

  const form = $('#authForm');
  const username = $('#username');
  const password = $('#password');
  const confirm = $('#confirm');
  const confirmRow = $('#confirmRow');
  const submit = $('#authSubmit');
  const msg = $('#authMsg');
  const tabs = [...document.querySelectorAll('.tab')];
  let mode = 'login';

  function showMessage(text) {
    msg.textContent = text;
    msg.hidden = !text;
  }

  function setMode(next) {
    mode = next;
    for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.mode === next));
    const register = next === 'register';
    confirmRow.hidden = !register;
    confirm.required = register;
    password.autocomplete = register ? 'new-password' : 'current-password';
    submit.textContent = register ? 'Create account' : 'Log in';
    $('#authTitle').textContent = register ? 'Begin your legend' : 'Welcome back';
    $('#authSub').textContent = register
      ? 'Create an account to start your adventure.'
      : 'Log in to continue your adventure.';
    $('#userHelp').hidden = $('#passHelp').hidden = !register;
    username.placeholder = register ? 'Choose a username' : 'Your username';
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
      const run = mode === 'register' ? Store.Accounts.register : Store.Accounts.login;
      const res = await run(username.value, password.value);
      if (res.ok) location.replace('characters.html');
      else showMessage(res.error);
    } catch (err) {
      showMessage('Something went wrong. Please try again.');
    } finally {
      submit.disabled = false;
    }
  });

  setMode('login');
  username.focus();
  MenuMusic.start();
})();
