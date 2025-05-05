const FlowManager = require('../FlowControl/FlowManager');
const clientBuyerFlow = require('../Flows/clientBuyerFlow/clientBuyerFlow');
//const clientSellerFlow = require('../clientBuyerFlow/clientSellerFlow');
const defaultFlow = require('../Flows/INIT/INIT');

class FlowMapper {
    async handleMessage(userId, message, sock, messageType) {

        //obtenemos el flow desde la memoria O BD, esto nos brindara, (Informacion de flow y step acutal, y los datos que hayamos persistido)
        let flow = await FlowManager.getFlow(userId);

        if (flow && flow.flowName) {
            switch (flow.flowName) {
                case 'COMPRAR':
                    await clientBuyerFlow.Handle(userId, message, flow.currentStep, sock, messageType);
                    break;

                case 'VENDER':
                    //await clientSellerFlow.Handle(userId, message, flow.currentStep, sock, messageType);
                    break;

                case 'DEFAULT':
                    await EgresoMaterialesFlow.Handle(userId, message, flow.currentStep, sock, messageType);
                    break;

                default:
                    await defaultFlow.handle(userId, message, sock, messageType);
                    break;
            }
        } else {
            await defaultFlow.Init(userId, message, sock, messageType);
        }
    }
}
module.exports = new FlowMapper();
