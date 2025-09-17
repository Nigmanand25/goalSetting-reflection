import React, { useState } from 'react';
import { promoteToAdmin, demoteFromAdmin, getAllUsers } from '@/utils/adminUtils';
import { useAuth } from '@/contexts/AuthContext';
import Card from '../shared/Card';

const AdminConsole: React.FC = () => {
  const { user, userRole } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setMessage(`✅ Loaded ${allUsers.length} users`);
    } catch (error) {
      setMessage('❌ Failed to load users');
    }
    setLoading(false);
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      await promoteToAdmin(userId);
      setMessage(`✅ User promoted to admin`);
      loadAllUsers(); // Refresh list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to promote user';
      setMessage(`❌ ${errorMessage}`);
    }
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    try {
      await demoteFromAdmin(userId);
      setMessage(`✅ User demoted to student`);
      loadAllUsers(); // Refresh list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to demote user';
      setMessage(`❌ ${errorMessage}`);
    }
  };

  const handleMakeMeAdmin = async () => {
    if (!user) return;
    try {
      await promoteToAdmin(user.uid);
      setMessage(`✅ You are now an admin! Refresh the page.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to make you admin';
      setMessage(`❌ ${errorMessage}`);
    }
  };

  return (
    <Card className="mt-6">
      <h3 className="text-xl font-semibold mb-4">� User Management</h3>
      
      {/* Quick Admin Button */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Quick Admin Access</h4>
        <button
          onClick={handleMakeMeAdmin}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
        >
          🚀 Make Me Admin
        </button>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
          Current user: {user?.email} | Role: {userRole}
        </p>
      </div>

      {/* User Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">User Management</h4>
          <button
            onClick={loadAllUsers}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Users'}
          </button>
        </div>

        {message && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
            <p className="text-sm">{message}</p>
          </div>
        )}

        {users.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                <div className="flex-1">
                  <p className="font-medium">{u.displayName}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{u.email}</p>
                  <p className="text-xs text-slate-500">Role: {u.role}</p>
                </div>
                <div className="flex space-x-2">
                  {u.role === 'student' ? (
                    <button
                      onClick={() => handlePromoteToAdmin(u.id)}
                      className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
                    >
                      Promote to Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDemoteFromAdmin(u.id)}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                    >
                      Demote to Student
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
        <h5 className="font-medium mb-2">ℹ️ User Management Notes:</h5>
        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
          <li>• Use this section to manage user roles and permissions</li>
          <li>• Promote students to admin to give them dashboard access</li>
          <li>• Demote admins back to students to revoke dashboard access</li>
          <li>• Changes take effect immediately</li>
        </ul>
      </div>
    </Card>
  );
};

export default AdminConsole;
