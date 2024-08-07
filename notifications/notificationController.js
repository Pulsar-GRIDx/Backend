
const notificationService = require('./notificationService');

exports.getAllNotificationsByDRN = (req, res) => {
  const DRN = req.params.DRN;

  notificationService.getNotificationsByDRN(DRN)
    .then(notifications => {
      // Add any necessary logic here
      res.status(200).json(notifications);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    });
};


exports.getAllCriticalNotifications = (req, res) => {
  
  notificationService.getAllCriticalNotifications()
    .then(notifications => {
      // Add any necessary logic here
      res.status(200).json(notifications);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    });
};


exports.getAll = (req, res) =>{

  notificationService.getAll()
  .then(notifications => {
    //Get All Notofications

    res.status(200).json({notification: [notifications]});
  })
 .catch(err =>{
  console.error(err);
  res.status(500).json({error: 'Failed to fetch notifications'});
 });
};

//Get notifications types


exports.getMeterNotificationsByType = function(req, res) {
  notificationService.getSumOfTypes((err, data) => {
        if (err) {
            console.error('Error querying MySQL:', err);
            res.status(404).send('No data found');
            return;
        }

        res.status(200).json(data);
    });
}

//Notification types by DRN
//Get notifications types


exports.getMeterNotificationsByTypeByDRN = function(req, res) {

  const DRN = req.params.DRN;

  notificationService.getSumOfTypesByDRN(DRN,(err, data) => {
        if (err) {
            console.error('Error querying MySQL:', err);
            res.status(404).send('No data found');
            return;
        }

        res.status(200).json(data);
    });
}

