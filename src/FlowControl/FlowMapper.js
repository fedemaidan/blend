const FlowManager = require('../FlowControl/FlowManager');
const clientBuyerFlow = require('../Flows/clientBuyerFlow/clientBuyerFlow');
const defaultFlow = require('../Flows/INIT/INIT');
const MenuFlow = require('../Flows/Menu/MenuFlow');
const ProductBlendFlow = require('../Flows/EleccionBlend/ProductBlendFlow');
const clientSellerFlow = require('../Flows/clientSellerFlow/clientSellerFlow')
class FlowMapper {
    async handleMessage(userId, message, sock, messageType) {
        //obtenemos el flow desde la memoria O BD, esto nos brindara, (Informacion de flow y step acutal, y los datos que hayamos persistido)
        let flow = await FlowManager.getFlow(userId);

        if (flow && flow.flowName) {
            switch (flow.flowName) {
                case 'COMPRA':
                    await clientBuyerFlow.Handle(userId, message, flow.currentStep, sock, messageType);
                    break;

                case 'VENTA':
                    await clientSellerFlow.Handle(userId, message, flow.currentStep, sock, messageType);
                    break;

                case 'MENU':
                    await MenuFlow.Handle(userId, message, flow.currentStep, sock, messageType);
                    break;

                case 'BLEND':
                    await ProductBlendFlow.Handle(userId, message, flow.currentStep, sock, messageType);
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
