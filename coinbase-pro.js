const {CoinbasePro} = require('coinbase-pro-node');

module.exports = function(RED) {
    function CoinbaseProNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;        

        // Retrieve the config node
        this.apikey = RED.nodes.getNode(config.apikey);        

        this.client = new CoinbasePro({
            apiKey: this.apikey.credentials.key,
            apiSecret: this.apikey.credentials.secret,
            passphrase: this.apikey.credentials.passphrase,
            // The Sandbox is for testing only and offers a subset of the products/assets:
            // https://docs.pro.coinbase.com/#sandbox
            useSandbox: false,
        });
        
        node.on('input', function(msg) {
                        
            const reportCurrency = "USD";

            node.client.rest.account.listAccounts().then(accounts => {

                var accountPromises = [];
              
                accounts.forEach(function(account) {
                    
                    accountPromises.push(new Promise(function(resolve,reject){
                        // ignore empty accounts
                        if (parseFloat(account.balance) != 0) {                    
                            
                            if(account.currency != reportCurrency) {
                    
                                //console.log(`Getting product ticker for ${account.currency}-${reportCurrency}`);

                                node.client.rest.product.getProductTicker(`${account.currency}-${reportCurrency}`).then(product => {

                                    account.reportBalance = parseFloat(account.balance)*parseFloat(product.price);
                                    account.product = product;

                                    resolve(account);
        
                                });
                            } else {

                                account.reportBalance = account.balance;

                                resolve(account);
                            }
                        } else {
                            resolve(null);
                        }
                    }));
                }); // forEach Account
                
                Promise.all(accountPromises).then((accounts) => {

                    msg.payload = accounts.filter(x => x);

                    node.send(msg);
                });
              }).catch(error => {
                  console.log(`Exception processing Coinbase Pro Accounts: ${error}`)
              });              
        });
    }
    RED.nodes.registerType("coinbase-pro",CoinbaseProNode);
}