# Bugno
## Installation
Install via npm
```
npm install https://github.com/activebridge/bugno-js
```

## Usage
    var Bugno = require('bugno-js');
    var bugno = new Bugno({
        accessToken: 'API-KEY',
        captureUncaught: true,
        captureUnhandledRejections: true
    });  

## Configuration
To setup additional configuration change defined Bugno object's properties.

##### itemsPerMinute
Send specified amount of errors per minute.
Default: ```60```

##### captureUncaught
Send uncaught errors if specified ```true```
Default: ```false```

##### captureUnhandledRejections
Send uncaught rejections if specified ```true```
Default: ```false```

##### scrubFields
Add which request params fields should be filtered (e.g. ```['password', 'creditCard']```)
Default scrubbed fields for servers:
```
["pw", "pass", "passwd", "password", "password_confirmation", "passwordConfirmation", "confirm_password", "confirmPassword", "secret", "secret_token", "secretToken", "secret_key", "secretKey", "api_key", "access_token", "accessToken", "authenticity_token", "oauth_token", "token", "user_session_secret", "request.session.csrf", "request.session._csrf", "request.params._csrf", "request.cookie", "request.cookies"]
```

Default scrubbed fields for browsers:
```
["pw", "pass", "passwd", "password", "secret", "confirm_password", "confirmPassword", "password_confirmation", "passwordConfirmation", "access_token", "accessToken", "secret_key", "secretKey", "secretToken", "cc-number", "card number", "cardnumber", "cardnum", "ccnum", "ccnumber", "cc num", "creditcardnumber", "credit card number", "newcreditcardnumber", "new credit card", "creditcardno", "credit card no", "card#", "card #", "cc-csc", "cvc2", "cvv2", "ccv2", "security code", "card verification", "name on credit card", "name on card", "nameoncard", "cardholder", "card holder", "name des karteninhabers", "card type", "cardtype", "cc type", "cctype", "payment type", "expiration date", "expirationdate", "expdate", "cc-exp"]
```
## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
