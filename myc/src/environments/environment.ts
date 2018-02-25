// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyBHxtsUB_1zWtijSjt6D0yExis_3_zDhis",
    authDomain: "mycommuneaty-dev.firebaseapp.com",
    databaseURL: "https://mycommuneaty-dev.firebaseio.com",
    projectId: "mycommuneaty-dev",
    storageBucket: "mycommuneaty-dev.appspot.com",
    messagingSenderId: "1029606336943"
  },
  facebookConfig: {
    appId            : '1555866924706582',
    autoLogAppEvents : true,
    xfbml            : true,
    version          : 'v2.12'
  },
  pageId: "1838269003092391",
  fbRedirectURI: "https://myc-dimitrikohn.c9users.io/"
};
