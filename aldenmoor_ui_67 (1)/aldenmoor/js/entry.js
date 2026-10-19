/** Landing redirect: logged in -> character select, otherwise -> login. */
location.replace(Store.Session.getUser() ? 'pages/characters.html' : 'pages/login.html');
