const cargarOferta = require('../../Utiles/Google/cargarOferta');
const FlowManager = require('../../../src/FlowControl/FlowManager');

module.exports = async function ConfessionarOferta(userId) {
    const flowData = FlowManager.userFlows[userId]?.flowData;
    const oferton = flowData.oferta;
    await cargarOferta(oferton,userId)
}