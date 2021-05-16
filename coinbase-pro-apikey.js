module.exports = function(RED) {
    function CoinbaseProApiKeyNode(config) {
        RED.nodes.createNode(this,config);        
    }

    RED.nodes.registerType("coinbase-pro-apikey",CoinbaseProApiKeyNode, {
        credentials: {
            key: {type: "text"},
            secret: {type:"password"},
            passphrase: {type:"password"}
        }
    });
}