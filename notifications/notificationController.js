
const notificationService = require('./notificationService');

exports.getAllNotificationsByDRN = (req, res) => {
  const DRN = req.params.DRN;

  notificationService.getNotificationsByDRN(DRN)
    .then(notifications => {
      // Add any necessary logic here
      res.json(notifications);
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
      res.json(notifications);
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

    res.json({notification: [notifications]});
  })
 .catch(err =>{
  console.error(err);
  res.status(500).json({error: 'Failed to fetch notifictions'});
 });
};