# Angular-With-Authentication

## Introduction
Angular-With-Authentication is a project that extends the functionality provided by the ASP.Net Core 2.0 Angular template shipped with Visual Studio to include user account management utilising Microsoft Identity.

A working prototype of the project is hosted on Azure at [angularwithauthentication.azurewebsites.net](https://angularwithauthentication.azurewebsites.net).

## Getting started

### 1. Set-up a database store
Create a data store with read/write access then add the following JSON to the user secrets file:
```javascript
"ConnectionStrings": {
  "DefaultConnection": "<your database connection string>"
}
```

The project has only been tested using Microsoft SQL Server as a data store, but in theory, it should work with any ADO.NET data store.  In the DEVELOPMENT environment, the project will automatically create the database schema required to support Microsoft Identity.  In the PRODUCTION environment, you will need to create this schema manually.

More information about user secrets in Visual Studio can be found here -> https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets?tabs=visual-studio.

### 2. Set-up Facebook authentication
The project supports external Facebook user authentication.  To set this up, create a Facebook app.  Good instructions for this can be found here -> https://auth0.com/docs/connections/social/facebook.

Once you have an App Id and an App Secret, replace the value of the "FacebookId" node in appsettings.DEVELOPMENT.json file with your Facebook app id.  Then add the following JSON to the user secrets file:
```javascript
"FacebookSecret": "<your Facebook app secret>"
```

### 3. Set-up Google recaptcha
The project uses Google Recaptcha to protect all anonymous forms.  First, [create a new Recaptcha site](https://www.google.com/recaptcha/admin).  Then in appsettings.DEVELOPMENT.json, replace the value of the "Recaptcha" : "Public" property with the Site key provided by Google.  In the user secrets file, add the following JSON:
```javascript
"Recaptcha": {
  "Secret": "<your Recaptcha secret key>"
}
```  

### 4. Set-up Sendgrid
The project uses [SendGrid](https://www.sendgrid.com) to perform email delivery.  To set this up, get a SendGrid key and add it to the user secrets file.
```javascript
"SendGrid": {
  "Secret": "<your SendGrid key>"
}
```

### 5. Set-up a JWT token
The project uses JWT tokens for user authentication.  These tokens are encrypted with a SymmetricSecurityKey, so you will need to provide a unique key for the encryption.  Choose a unique encryption string, then in the user secrets, add the following JSON.
```javascript
"Jwt": {
  "Secret": "<your unique encryption string>"
}
```
