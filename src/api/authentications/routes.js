const routes = (handler) => [
  {
    metod: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
  },
  {
    metod: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler,
  },
  {
    metod: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler,
  },
];

module.exports = routes;
