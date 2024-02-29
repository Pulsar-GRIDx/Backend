// function convertDataToMockTree(data) {
//     let mockTreeData = [];
  
//     for (const city in data) {
//       let cityActiveEnergy = 0;
//       const cityNode = {
//         key: `${city}`,
//         title: `City: ${city}`,
//         children: [],
//       };
  
//       for (const locationName in data[city]) {
//         let locationActiveEnergy = 0;
//         const locationNode = {
//           key: `${city}-${locationName}`,
//           title: `Location: ${locationName}`,
//           children: [],
//         };
  
//         for (const transformerName in data[city][locationName].transformers) {
//           const transformerData = data[city][locationName].transformers[transformerName];
//           const transformerNode = {
//             key: `${city}-${locationName}-${transformerName}`,
//             title: `Transformer: ${transformerName}, Active Energy: ${(transformerData.active_energy / 1000).toFixed(2)} kWh`,
//             children: [],
            
//           };
//         // console.log(transformerData.active_energy,cityActiveEnergy,locationActiveEnergy);
//           transformerData.meters.forEach(meterData => {
//             transformerNode.children.push({
//               key: `${city}-${locationName}-${transformerName}-${meterData.DRN}`,
//               title: `DRN: ${meterData.DRN}, Active Energy: ${(meterData.active_energy / 1000).toFixed(2)} kWh`,
//             });
//           });
  
//           locationNode.children.push(transformerNode);
//           locationActiveEnergy += transformerData.active_energy;
//         }
  
//         locationNode.title += `, Active Energy: ${(locationActiveEnergy / 1000).toFixed(2)} kWh`;
//         cityNode.children.push(locationNode);
//         cityActiveEnergy += locationActiveEnergy;
//       }
  
//       cityNode.title += `, Active Energy: ${(cityActiveEnergy / 1000).toFixed(2)} kWh`;
//       mockTreeData.push(cityNode);
//     }
  
//     return mockTreeData;
//   }