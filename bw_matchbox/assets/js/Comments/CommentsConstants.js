modules.define(
  'CommentsConstants',
  [
    // Required modules...
  ],
  function provide_CommentsConstants(
    provide,
    // Resolved modules...
  ) {
    // Determine environment...
    const { host } = window.location;
    const isDev = host === 'localhost:5000';

    // Define module...

    /* @desc Shared constants
     */
    const CommentsConstants = {
      __id: 'CommentsConstants',

      // Determine environment...
      isDev,
      isProd: !isDev,

      // DEBUG: useDebug -- specify debug mode. Don't use it for production!
      useDebug: true && isDev,

      /** Api base */
      readCommentsApiUrl: '/comments/read',
      resolveThreadApiUrl: '/comments/resolve-thread',
      createCommentApiUrl: '/comments/create-comment',

      /** Intl.DateTimeFormat parameters... */
      dateTimeFormatLocale: 'en-GB',
      dateTimeFormatOptions: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        // second: 'numeric',
      },
    };

    // Provide module...
    provide(CommentsConstants);
  },
);
