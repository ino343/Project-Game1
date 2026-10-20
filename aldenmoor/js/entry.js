/** Landing redirect: logged in -> character select, otherwise -> login. */
Store.ready.then(() => location.replace(Store.Session.getUser() ? 'pages/characters.html' : 'pages/login.html'));
