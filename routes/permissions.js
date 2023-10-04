// PermissionsMiddleware.js


//Roles with permissions
const roles = {
    user: {
      can: ['read']
    },
    admin: {
      can: ['read', 'write', 'delete','create']
    }
  };
  


module.exports = function checkPermissions(permissions) {
    return (req, res, next) => {
      const  role  = req.user;
       
  
      if (!role || !roles[role]) {
        return res.status(403).json({ error: 'Access denied' });
      }
  
      const allowedPermissions = roles[role].can;
  
      // Check if the user's role has the required permissions
      const hasPermission = permissions.every((permission) =>
        allowedPermissions.includes(permission)
      );
  
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
  
      // User has the required permissions, proceed to the route handler
      next();
    };
  };
  