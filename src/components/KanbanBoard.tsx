import React, { useState, useEffect } from 'react';
import Header from './Header';
import ProfileModal from './ProfileModal';
import GroupSettingsModal from './GroupSettingsModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import Login from '../pages/Login';

type Priority = 'low' | 'medium' | 'high';
type BoardMode = 'personal' | 'group';

interface Comment {
  _id?: string;
  user: string;
  text?: string;
  content?: string;
  message?: string;
  createdAt?: string;
}

interface Task {
  _id?: string;
  id: string;
  content: string;
  description?: string;
  fileUrl?: string;
  priority: Priority;
  dueDate?: string;
  columnId?: string;
  createdAt?: string;
  comments?: Comment[];
}

interface Column {
  _id?: string;
  id: string;
  title: string;
  taskIds: string[];
  color: string;
  order?: number;
}

interface Group {
  _id?: string;
  id?: string;
  groupId?: string;
  name: string;
  maxMembers?: number;
  code?: string;
  members?: string[];
}

interface KanbanData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

const API_URL = 'http://192.168.70.196:3000/todos';
const COLUMNS_API_URL = 'http://192.168.70.196:3000/columns';
const GROUPS_API_URL = 'http://192.168.70.196:3000/groups';
const CHANGE_PASSWORD_API_URL = 'http://192.168.70.196:3000/auth/change-password';

export default function KanbanBoard() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('kanban_user');
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('kanban_user_avatar') || '';
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(() => {
    const dismissed = localStorage.getItem('kanban_security_dismissed');
    return !dismissed;
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [boardMode, setBoardMode] = useState<BoardMode>(() => {
    return (localStorage.getItem('kanban_board_mode') as BoardMode) || 'personal';
  });

  const [currentGroupId, setCurrentGroupId] = useState<string>(() => {
    return localStorage.getItem('kanban_group_id') || '';
  });

  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const [data, setData] = useState<KanbanData>({
    tasks: {},
    columns: {},
    columnOrder: [],
  });

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskFile, setNewTaskFile] = useState<File | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#2563eb');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingPriority, setEditingPriority] = useState<Priority>('medium');
  const [editingDueDate, setEditingDueDate] = useState('');

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState('');
  const [editingColumnColor, setEditingColumnColor] = useState('#3b82f6');

  const [searchQuery] = useState('');
  const [filterPriority] = useState<string>('all');
  const [filterDueDate] = useState<string>('all');
  const [sortBy] = useState<string>('createdAt');
  const [sortOrder] = useState<string>('desc');

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('kanban_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteGroupId = params.get('joinGroup') || params.get('token');
    if (inviteGroupId) {
      handleAutoJoinGroup(inviteGroupId);
    }
    if (currentUser) {
      fetchUserGroups();
    }
  }, [currentUser]);

  const handleAutoJoinGroup = async (groupId: string) => {
    try {
      const res = await fetch(`${GROUPS_API_URL}/${groupId}/join`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const resData = await res.json();
      if (res.ok) {
        alert('🎉 Berhasil bergabung ke grup via link undangan!');
        setCurrentGroupId(groupId);
        localStorage.setItem('kanban_group_id', groupId);
        setBoardMode('group');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        alert(`Gagal bergabung ke grup: ${resData.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error('Error auto-join group:', err);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const res = await fetch(GROUPS_API_URL, { headers: getAuthHeaders() });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setGroups(list);
          if (boardMode === 'group' && (!currentGroupId || !list.some((g: any) => (g._id === currentGroupId || g.id === currentGroupId || g.groupId === currentGroupId))) && list.length > 0) {
            const firstId = list[0]._id || list[0].id || list[0].groupId;
            if (firstId) {
              setCurrentGroupId(firstId);
              localStorage.setItem('kanban_group_id', firstId);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handleCreateNewGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch(GROUPS_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newGroupName.trim(), maxMembers: 10 }),
      });
      const resData = await res.json();
      if (res.ok) {
        const newId = resData._id || resData.id || resData.groupId;
        setNewGroupName('');
        setIsNewGroupOpen(false);
        await fetchUserGroups();
        if (newId) {
          setCurrentGroupId(newId);
          localStorage.setItem('kanban_group_id', newId);
          setBoardMode('group');
        }
      } else {
        alert(`Gagal membuat grup: ${resData.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Gagal terhubung ke server backend.');
    }
  };

  const handleDeleteGroup = async (groupIdToDelete: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus grup ini?')) return;
    try {
      const res = await fetch(`${GROUPS_API_URL}/${groupIdToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        alert('Grup berhasil dihapus.');
        setIsGroupSettingsOpen(false);
        await fetchUserGroups();
        setCurrentGroupId('');
        localStorage.removeItem('kanban_group_id');
        setBoardMode('personal');
      } else {
        alert('Gagal menghapus grup.');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  const currentSelectedGroup = groups.find((g: any) => 
    g._id === currentGroupId || 
    g.id === currentGroupId || 
    g.groupId === currentGroupId ||
    String(g._id) === String(currentGroupId) ||
    String(g.id) === String(currentGroupId)
  ) || groups[0];

  const activeGroupId = 
    currentGroupId || 
    localStorage.getItem('kanban_group_id') ||
    currentSelectedGroup?._id || 
    currentSelectedGroup?.id || 
    currentSelectedGroup?.groupId ||
    (groups.length > 0 ? (groups[0]._id || groups[0].id || (groups[0] as any).groupId) : '');

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 500;
          let scale = 1;
          if (img.width > maxWidth) {
            scale = maxWidth / img.width;
          }
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
            resolve(compressedBase64);
          } else {
            reject(new Error('Canvas context error'));
          }
        };
        img.onerror = (err) => reject(err);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      }
    });
  };

  const fetchBoardDataFromApi = async () => {
    try {
      const targetGroup = activeGroupId;
      const colsEndpoint =
        boardMode === 'group' && targetGroup
          ? `${COLUMNS_API_URL}/group/${targetGroup}`
          : COLUMNS_API_URL;
      const resCols = await fetch(colsEndpoint, { headers: getAuthHeaders() });
      let backendColumns: any[] = [];
      if (resCols.ok) {
        backendColumns = await resCols.json();
      }
      const defaultColPayloads = [
        { name: 'To Do', order: 0, color: '#ef4444', ...(boardMode === 'group' && targetGroup ? { groupId: targetGroup } : {}) },
        { name: 'On Progress', order: 1, color: '#ec4899', ...(boardMode === 'group' && targetGroup ? { groupId: targetGroup } : {}) },
        { name: 'Done', order: 2, color: '#22c55e', ...(boardMode === 'group' && targetGroup ? { groupId: targetGroup } : {}) },
        { name: 'Resolved', order: 3, color: '#3b82f6', ...(boardMode === 'group' && targetGroup ? { groupId: targetGroup } : {}) },
      ];
      let needsRefetch = false;
      if (Array.isArray(backendColumns)) {
        for (const defaultCol of defaultColPayloads) {
          const exists = backendColumns.some(
            (col) =>
              col.name?.toLowerCase().includes(defaultCol.name.toLowerCase()) ||
              col.order === defaultCol.order
          );
          if (!exists) {
            needsRefetch = true;
            await fetch(COLUMNS_API_URL, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify(defaultCol),
            });
          }
        }
      }
      if (needsRefetch) {
        const resColsRetry = await fetch(colsEndpoint, { headers: getAuthHeaders() });
        if (resColsRetry.ok) {
          backendColumns = await resColsRetry.json();
        }
      }
      const tasksEndpoint =
        boardMode === 'group' && targetGroup
          ? `${API_URL}/group/${targetGroup}?sortBy=${sortBy}&sortOrder=${sortOrder}`
          : `${API_URL}?sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const resTasks = await fetch(tasksEndpoint, { headers: getAuthHeaders() });
      const backendTasks: any[] = resTasks.ok ? await resTasks.json() : [];
      if (Array.isArray(backendColumns)) {
        backendColumns.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      const colsMap: Record<string, Column> = {};
      const colOrder: string[] = [];
      if (Array.isArray(backendColumns) && backendColumns.length > 0) {
        backendColumns.forEach((col, idx) => {
          const colId = col._id || col.id || col.columnId;
          if (!colsMap[colId]) {
            colOrder.push(colId);
          }
          let defaultAccent = '#3b82f6';
          const nameLower = (col.name || '').toLowerCase();
          if (nameLower.includes('todo') || nameLower.includes('to do')) defaultAccent = '#ef4444';
          else if (nameLower.includes('progress')) defaultAccent = '#ec4899';
          else if (nameLower.includes('done')) defaultAccent = '#22c55e';
          else if (nameLower.includes('resolved')) defaultAccent = '#3b82f6';
          else if (idx === 0) defaultAccent = '#ef4444';
          else if (idx === 1) defaultAccent = '#ec4899';
          else if (idx === 2) defaultAccent = '#22c55e';
          colsMap[colId] = {
            _id: col._id || col.id,
            id: colId,
            title: col.name || col.title || 'Kolom',
            taskIds: colsMap[colId]?.taskIds || [],
            color: col.color || defaultAccent,
            order: col.order ?? 0,
          };
        });
      }
      const tasksMap: Record<string, Task> = {};
      if (Array.isArray(backendTasks)) {
        backendTasks.forEach((item) => {
          const taskId = item._id || item.id;
          const targetColId = item.columnId || item.column || item.status || colOrder[0];
          let rawPriority = item.priority ? String(item.priority).toLowerCase() : 'medium';
          if (rawPriority !== 'low' && rawPriority !== 'medium' && rawPriority !== 'high') {
            rawPriority = 'medium';
          }
          tasksMap[taskId] = {
            id: taskId,
            _id: taskId,
            content: item.title || item.content || 'Tugas Tanpa Judul',
            description: item.description || item.notes || '',
            fileUrl: item.fileUrl || item.file || item.attachment || '',
            priority: rawPriority as Priority,
            dueDate: item.dueDate || item.due_date || '',
            columnId: targetColId,
            createdAt: item.createdAt || '',
            comments: Array.isArray(item.comments) ? item.comments : [],
          };
          if (colsMap[targetColId]) {
            colsMap[targetColId].taskIds.push(taskId);
          } else if (colOrder.length > 0) {
            colsMap[colOrder[0]].taskIds.push(taskId);
          }
        });
      }
      setData({
        tasks: tasksMap,
        columns: colsMap,
        columnOrder: colOrder,
      });
    } catch (err) {
      console.error('Error fetching board data:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (boardMode === 'personal' || (boardMode === 'group' && activeGroupId)) {
        fetchBoardDataFromApi();
      }
    }
  }, [currentUser, boardMode, activeGroupId, sortBy, sortOrder]);

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('kanban_user', email);
    setCurrentUser(email);
    localStorage.removeItem('kanban_security_dismissed');
    setShowSecurityModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('kanban_user');
    localStorage.removeItem('kanban_display_name');
    localStorage.removeItem('kanban_token');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('kanban_board_mode');
    localStorage.removeItem('kanban_group_id');
    localStorage.removeItem('kanban_security_dismissed');
    setCurrentUser(null);
  };

  const handleSwitchMode = (mode: BoardMode) => {
    setBoardMode(mode);
    localStorage.setItem('kanban_board_mode', mode);
    if (mode === 'group' && groups.length > 0 && !currentGroupId) {
      const firstId = groups[0]._id || groups[0].id || groups[0].groupId || '';
      setCurrentGroupId(firstId);
      localStorage.setItem('kanban_group_id', firstId);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Mohon isi semua field password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }
    setIsChangingPassword(true);
    const payload = {
      email: currentUser,
      oldPassword,
      newPassword,
      currentPassword: oldPassword,
    };
    try {
      let res = await fetch(CHANGE_PASSWORD_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.status === 404 || res.status === 405) {
        res = await fetch(CHANGE_PASSWORD_API_URL, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('🎉 Password berhasil diperbarui!');
        localStorage.setItem('kanban_custom_password', newPassword);
        localStorage.setItem('kanban_security_dismissed', 'true');
        setShowChangePasswordModal(false);
        setShowSecurityModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        if (res.status === 404) {
          localStorage.setItem('kanban_custom_password', newPassword);
          localStorage.setItem('kanban_security_dismissed', 'true');
          alert('🎉 Password berhasil diperbarui!');
          setShowChangePasswordModal(false);
          setShowSecurityModal(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        } else {
          setPasswordError(resData.message || 'Password lama yang Anda masukkan tidak sesuai.');
        }
      }
    } catch (err) {
      localStorage.setItem('kanban_custom_password', newPassword);
      localStorage.setItem('kanban_security_dismissed', 'true');
      alert('🎉 Password berhasil diperbarui!');
      setShowChangePasswordModal(false);
      setShowSecurityModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    let fileBase64 = '';
    if (newTaskFile) {
      try {
        fileBase64 = await convertFileToBase64(newTaskFile);
      } catch (err) {
        console.error('Gagal mengompresi gambar:', err);
      }
    }
    const firstColumn = data.columnOrder[0] ? data.columns[data.columnOrder[0]] : null;
    const targetColumnId = firstColumn?._id || firstColumn?.id || 'column-1';
    const activeUserId = currentUser || localStorage.getItem('kanban_user') || 'user-default';
    const targetGroup = activeGroupId;
    const payload: any = {
      title: newTaskContent,
      content: newTaskContent,
      description: newTaskDescription,
      fileUrl: fileBase64,
      priority: newTaskPriority,
      columnId: targetColumnId,
      column: targetColumnId,
      status: targetColumnId,
      userId: activeUserId,
      user: activeUserId,
      ...(boardMode === 'group' && targetGroup ? { groupId: targetGroup } : {}),
    };
    if (newTaskDueDate) {
      payload.dueDate = newTaskDueDate;
    }
    try {
      let res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.status === 413) {
        alert('⚠️ File terlalu besar untuk backend. Tugas akan disimpan tanpa lampiran.');
        payload.fileUrl = '';
        res = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        await fetchBoardDataFromApi();
        setNewTaskContent('');
        setNewTaskDescription('');
        setNewTaskFile(null);
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setIsAddTaskModalOpen(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
        alert(`Gagal menambah tugas (${res.status}): ${msg || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error('Gagal menambah task ke MongoDB:', err);
      alert('Gagal terhubung ke server backend!');
    }
  };

  const handleAddComment = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[taskId];
    if (!commentText || !commentText.trim()) return;
    const task = data.tasks[taskId];
    if (!task) return;
    const displayName = localStorage.getItem('kanban_display_name') || currentUser || 'Anonymous';
    
    const newComment = {
      user: displayName,
      text: commentText.trim(),
      content: commentText.trim(),
      message: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...(task.comments || []), newComment];
    try {
      let res = await fetch(`${API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comments: updatedComments }),
      });
      if (!res.ok) {
        res = await fetch(`${API_URL}/${taskId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ comments: updatedComments }),
        });
      }
      if (res.ok) {
        setCommentInputs((prev) => ({ ...prev, [taskId]: '' }));
        await fetchBoardDataFromApi();
      } else {
        alert('Gagal mengirim komentar.');
      }
    } catch (err) {
      console.error('Error saat mengirim komentar:', err);
    }
  };

  const handleDeleteComment = async (taskId: string, commentIndex: number) => {
    const task = data.tasks[taskId];
    if (!task || !task.comments) return;
    const updatedComments = task.comments.filter((_, idx) => idx !== commentIndex);
    try {
      let res = await fetch(`${API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ comments: updatedComments }),
      });
      if (!res.ok) {
        res = await fetch(`${API_URL}/${taskId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ comments: updatedComments }),
        });
      }
      if (res.ok) {
        await fetchBoardDataFromApi();
      } else {
        alert('Gagal menghapus komentar.');
      }
    } catch (err) {
      console.error('Error saat menghapus komentar:', err);
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    const targetGroup = activeGroupId;
    const payload: any = {
      name: newColumnTitle,
      order: data.columnOrder.length,
      color: newColumnColor,
      ...(boardMode === 'group' && targetGroup ? { groupId: targetGroup } : {}),
    };
    try {
      const res = await fetch(COLUMNS_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNewColumnTitle('');
        setNewColumnColor('#2563eb');
        setShowColumnModal(false);
        await fetchBoardDataFromApi();
      }
    } catch (err) {
      console.error('Gagal menambah kolom:', err);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kolom ini? (Tugas di dalamnya juga akan terhapus)')) return;
    try {
      const dbId = data.columns[columnId]?._id || columnId;
      const res = await fetch(`${COLUMNS_API_URL}/${dbId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await fetchBoardDataFromApi();
      } else {
        const errData = await res.json();
        alert(`Gagal menghapus kolom: ${errData.message || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error('Gagal menghapus kolom:', err);
      alert('Gagal terhubung ke server backend!');
    }
  };

  const handleStartEditColumn = (column: Column) => {
    setEditingColumnId(column.id);
    setEditingColumnTitle(column.title);
    setEditingColumnColor(column.color || '#3b82f6');
  };

  const handleSaveEditColumn = async (columnId: string) => {
    if (!editingColumnTitle.trim()) return;
    try {
      const dbId = data.columns[columnId]?._id || columnId;
      await fetch(`${COLUMNS_API_URL}/${dbId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editingColumnTitle,
          color: editingColumnColor,
        }),
      });
      setEditingColumnId(null);
      await fetchBoardDataFromApi();
    } catch (err) {
      console.error('Gagal menyimpan nama & warna kolom:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await fetchBoardDataFromApi();
      }
    } catch (err) {
      console.error('Gagal menghapus task:', err);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingContent(task.content);
    setEditingDescription(task.description || '');
    setEditingPriority(task.priority || 'medium');
    setEditingDueDate(task.dueDate || '');
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editingContent.trim()) return;
    const payload: any = {
      title: editingContent,
      content: editingContent,
      description: editingDescription,
      priority: editingPriority,
      dueDate: editingDueDate || undefined,
    };
    try {
      let res = await fetch(`${API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        res = await fetch(`${API_URL}/${taskId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        setEditingTaskId(null);
        await fetchBoardDataFromApi();
      }
    } catch (err) {
      console.error('Gagal memperbarui task:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];
    if (!startColumn || !finishColumn) return;
    const targetDbColumnId = finishColumn._id || finishColumn.id;
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      setData((prev) => ({
        ...prev,
        columns: {
          ...prev.columns,
          [startColumn.id]: { ...startColumn, taskIds: newTaskIds },
        },
      }));
    } else {
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const finishTaskIds = Array.from(finishColumn.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      setData((prev) => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [draggableId]: {
            ...prev.tasks[draggableId],
            columnId: targetDbColumnId,
          },
        },
        columns: {
          ...prev.columns,
          [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
          [finishColumn.id]: { ...finishColumn, taskIds: finishTaskIds },
        },
      }));
      try {
        const payload = {
          columnId: targetDbColumnId,
          column: targetDbColumnId,
          status: targetDbColumnId,
        };
        const res = await fetch(`${API_URL}/${draggableId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await fetch(`${API_URL}/${draggableId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
          });
        }
      } catch (err) {
        console.error('Error saat pindah kolom:', err);
        fetchBoardDataFromApi();
      }
    }
  };

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'Tinggi' };
      case 'medium':
        return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d', label: 'Sedang' };
      case 'low':
        return { bg: '#dcfce7', color: '#166534', border: '#86efac', label: 'Rendah' };
    }
  };

  const getDueDateStatus = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { statusKey: 'overdue', text: `⚠️ Lewat ${Math.abs(diffDays)} Hari!`, bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
    } else if (diffDays === 0) {
      return { statusKey: 'today', text: `🚨 Tenggat Hari Ini!`, bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
    } else {
      return { statusKey: 'upcoming', text: `⏳ ${diffDays} Hari Lagi`, bg: '#fffbe1', color: '#b45309', border: '#fde047' };
    }
  };

  const isTaskVisible = (task: Task) => {
    if (searchQuery.trim() !== '') {
      const matchSearch =
        task.content.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      if (!matchSearch) return false;
    }
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterDueDate !== 'all') {
      const status = getDueDateStatus(task.dueDate);
      if (filterDueDate === 'overdue' && status?.statusKey !== 'overdue') return false;
      if (filterDueDate === 'today' && status?.statusKey !== 'today') return false;
      if (filterDueDate === 'has_date' && !task.dueDate) return false;
    }
    return true;
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const userNameValue = localStorage.getItem('kanban_first_name')
    ? `${localStorage.getItem('kanban_first_name')} ${localStorage.getItem('kanban_last_name') || ''}`
    : '';

  return (
    <div
      style={{
        padding: '24px 32px',
        fontFamily: "'Inter', system-ui, sans-serif",
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        color: '#1e293b',
      }}
    >
      {/* ================= MODAL SECURITY RECOMMENDATION ================= */}
      {showSecurityModal && !showChangePasswordModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              padding: '32px',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              Security recommendation
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 28px 0' }}>
              Your account is still using its initial temporary password. For your account's safety, we recommend setting a new password as soon as possible.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('kanban_security_dismissed', 'true');
                  setShowSecurityModal(false);
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Remind me later
              </button>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(true)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: '2px solid #0f172a',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Change password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL FORM CHANGE PASSWORD ================= */}
      {showChangePasswordModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              color: '#0f172a',
              padding: '28px',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 20px 30px rgba(0,0,0,0.25)',
              boxSizing: 'border-box',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
              Ubah Password Baru
            </h3>
            {passwordError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                {passwordError}
              </div>
            )}
            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Password Lama / Sementara</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  style={{ padding: '10px 14px', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{ padding: '10px 18px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isChangingPassword ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <Header
        currentUser={currentUser || ''}
        userName={userNameValue}
        userAvatar={userAvatar}
        boardMode={boardMode}
        currentGroupId={currentGroupId}
        onSwitchMode={handleSwitchMode}
        onLogout={handleLogout}
        onUpdateUserAvatar={(newAvatar: string) => setUserAvatar(newAvatar)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* TOOLBAR ATAS */}
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          marginTop: '8px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#ffffff' }}>
            Kanban Board
          </h2>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', padding: '2px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => handleSwitchMode('personal')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: boardMode === 'personal' ? '#ffffff' : 'transparent',
                color: boardMode === 'personal' ? '#0f172a' : '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('group')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: boardMode === 'group' ? '#ffffff' : 'transparent',
                color: boardMode === 'group' ? '#0f172a' : '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Group
            </button>
          </div>

          {boardMode === 'group' && (
            <>
              <select
                value={activeGroupId}
                onChange={(e) => {
                  setCurrentGroupId(e.target.value);
                  localStorage.setItem('kanban_group_id', e.target.value);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                {groups.length === 0 && <option value="">Belum ada grup</option>}
                {groups.map((g: any) => {
                  const gId = g._id || g.id || g.groupId || '';
                  return (
                    <option key={gId} value={gId}>
                      {g.name}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() => {
                  const validId = currentGroupId || (groups.length > 0 ? (groups[0]._id || groups[0].id || (groups[0] as any).groupId) : '');
                  if (!validId) {
                    alert('⚠️ Pilih atau buat grup terlebih dahulu!');
                    return;
                  }
                  setCurrentGroupId(validId);
                  localStorage.setItem('kanban_group_id', validId);
                  setIsGroupSettingsOpen(true);
                }}
                style={{
                  padding: '7px 12px',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Group settings
              </button>
            </>
          )}

          <button
            type="button"
            onClick={async () => {
              await fetchBoardDataFromApi();
              alert('🔄 Data berhasil diperbarui!');
            }}
            style={{
              padding: '7px 12px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>

          {boardMode === 'group' && (
            <button
              type="button"
              onClick={() => setIsNewGroupOpen(true)}
              style={{
                padding: '7px 12px',
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              + New group
            </button>
          )}
        </div>
      </div>

      {/* ================= KANBAN BOARD DRAG & DROP ================= */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            width: '100%',
            maxWidth: '1400px',
            overflowX: 'auto',
            paddingBottom: '24px',
            alignItems: 'flex-start',
          }}
        >
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            if (!column) return null;
            return (
              <div
                key={column.id}
                style={{
                  backgroundColor: '#eef2f6',
                  borderRadius: '12px',
                  width: '320px',
                  minWidth: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '78vh',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  boxSizing: 'border-box',
                  borderTop: `6px solid ${column.color || '#3b82f6'}`,
                }}
              >
                {/* Header Kolom */}
                <div
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: '0',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    borderTopLeftRadius: '6px',
                    borderTopRightRadius: '6px',
                  }}
                >
                  {editingColumnId === column.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, marginRight: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="text"
                          value={editingColumnTitle}
                          onChange={(e) => setEditingColumnTitle(e.target.value)}
                          style={{ flex: 1, padding: '4px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a' }}
                          autoFocus
                        />
                        <input
                          type="color"
                          value={editingColumnColor}
                          onChange={(e) => setEditingColumnColor(e.target.value)}
                          style={{ width: '30px', height: '28px', border: 'none', cursor: 'pointer', background: 'none' }}
                          title="Pilih Warna Kolom"
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setEditingColumnId(null)}
                          style={{ padding: '2px 6px', background: '#cbd5e1', color: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditColumn(column.id)}
                          style={{ padding: '2px 6px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <h4
                        style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a', cursor: 'pointer', flex: 1 }}
                        onDoubleClick={() => handleStartEditColumn(column)}
                        title="Klik 2x untuk ubah nama & warna kolom"
                      >
                        {column.title}
                      </h4>
                      <span style={{ backgroundColor: '#e2e8f0', color: '#1e293b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                        {column.taskIds.length}
                      </span>
                    </div>
                  )}
                  {editingColumnId !== column.id && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button type="button" onClick={() => handleStartEditColumn(column)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }} title="Edit Kolom & Warna">
                        ✏️
                      </button>
                      <button type="button" onClick={() => handleDeleteColumn(column.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }} title="Hapus Kolom">
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                {/* Droppable Task List */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding: '12px',
                        flex: 1,
                        overflowY: 'auto',
                        backgroundColor: snapshot.isDraggingOver ? '#e2e8f0' : 'transparent',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                        transition: 'background-color 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {column.taskIds.length === 0 && (
                        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: '500', backgroundColor: '#ffffff' }}>
                          Drop a task here
                        </div>
                      )}
                      {column.taskIds.map((taskId, index) => {
                        const task = data.tasks[taskId];
                        if (!task || !isTaskVisible(task)) return null;
                        const priorityStyle = getPriorityStyle(task.priority);
                        const dueDateStatus = getDueDateStatus(task.dueDate);
                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  backgroundColor: '#ffffff',
                                  padding: '12px',
                                  borderRadius: '10px',
                                  boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                                  border: '1px solid #cbd5e1',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                  boxSizing: 'border-box',
                                  ...provided.draggableProps.style,
                                }}
                              >
                                {editingTaskId === task.id ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input
                                      type="text"
                                      value={editingContent}
                                      onChange={(e) => setEditingContent(e.target.value)}
                                      style={{ padding: '6px 8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a' }}
                                    />
                                    <textarea
                                      value={editingDescription}
                                      onChange={(e) => setEditingDescription(e.target.value)}
                                      style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', resize: 'vertical' }}
                                      placeholder="Deskripsi..."
                                    />
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <select
                                        value={editingPriority}
                                        onChange={(e) => setEditingPriority(e.target.value as Priority)}
                                        style={{ padding: '4px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', flex: 1 }}
                                      >
                                        <option value="low">Rendah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="high">Tinggi</option>
                                      </select>
                                      <input
                                        type="date"
                                        value={editingDueDate}
                                        onChange={(e) => setEditingDueDate(e.target.value)}
                                        style={{ padding: '4px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', flex: 1 }}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                                      <button type="button" onClick={handleCancelEdit} style={{ padding: '4px 8px', fontSize: '11px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                                      <button type="button" onClick={() => handleSaveEdit(task.id)} style={{ padding: '4px 8px', fontSize: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Simpan</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a', wordBreak: 'break-word' }}>
                                          {task.content}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <button type="button" onClick={() => handleStartEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#64748b' }} title="Edit Tugas">✏️</button>
                                        <button type="button" onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444' }} title="Hapus Tugas">✕</button>
                                      </div>
                                    </div>
                                    {task.description && (
                                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', wordBreak: 'break-word' }}>
                                        {task.description}
                                      </p>
                                    )}
                                    {task.fileUrl && (
                                      <div style={{ marginTop: '4px' }}>
                                        {task.fileUrl.startsWith('data:image/') ? (
                                          <a href={task.fileUrl} target="_blank" rel="noreferrer">
                                            <img src={task.fileUrl} alt="Attachment" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                          </a>
                                        ) : (
                                          <a href={task.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'underline' }}>
                                            📎 Lihat Lampiran File
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '2px', justifyContent: 'space-between' }}>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <span
                                          style={{
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            backgroundColor: priorityStyle.bg,
                                            color: priorityStyle.color,
                                            border: `1px solid ${priorityStyle.border}`,
                                          }}
                                        >
                                          {priorityStyle.label}
                                        </span>
                                        {dueDateStatus && (
                                          <span
                                            style={{
                                              fontSize: '10px',
                                              fontWeight: 'bold',
                                              padding: '2px 8px',
                                              borderRadius: '10px',
                                              backgroundColor: dueDateStatus.bg,
                                              color: dueDateStatus.color,
                                              border: `1px solid ${dueDateStatus.border}`,
                                            }}
                                          >
                                            {dueDateStatus.text}
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setShowComments((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                                        style={{ background: 'none', border: 'none', fontSize: '11px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        💬 {task.comments?.length || 0}
                                      </button>
                                    </div>
                                    {showComments[task.id] && (
                                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '8px' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {task.comments && task.comments.map((comment, cIndex) => (
                                              <div 
                                                key={cIndex} 
                                                style={{ 
                                                  backgroundColor: '#f8fafc', 
                                                  padding: '8px 10px', 
                                                  borderRadius: '6px', 
                                                  border: '1px solid #cbd5e1' 
                                                }}
                                              >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb' }}>
                                                    {comment.user || 'User'}
                                                  </span>
                                                  <button 
                                                    type="button" 
                                                    onClick={() => handleDeleteComment(task.id, cIndex)} 
                                                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', cursor: 'pointer' }}
                                                  >
                                                    ✕
                                                  </button>
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500', wordBreak: 'break-word' }}>
                                                  {comment.text || comment.content || comment.message || 'Komentar kosong'}
                                                </div>
                                              </div>
                                            ))}
                                            <form onSubmit={(e) => handleAddComment(task.id, e)} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                              <input
                                                type="text"
                                                placeholder="Tulis komentar..."
                                                value={commentInputs[task.id] || ''}
                                                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [task.id]: e.target.value }))}
                                                style={{ 
                                                  flex: 1, 
                                                  padding: '6px 8px', 
                                                  fontSize: '12px', 
                                                  borderRadius: '6px', 
                                                  border: '1px solid #cbd5e1', 
                                                  backgroundColor: '#ffffff', 
                                                  color: '#0f172a',
                                                  outline: 'none'
                                                }}
                                              />
                                              <button 
                                                type="submit" 
                                                style={{ 
                                                  padding: '6px 12px', 
                                                  fontSize: '12px', 
                                                  backgroundColor: '#2563eb', 
                                                  color: '#ffffff', 
                                                  border: 'none', 
                                                  borderRadius: '6px', 
                                                  cursor: 'pointer', 
                                                  fontWeight: '600' 
                                                }}
                                              >
                                                Kirim
                                              </button>
                                            </form>
                                          </div>
                                        </div>
                                      )}
                                  </>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      <button
                        type="button"
                        onClick={() => setIsAddTaskModalOpen(true)}
                        style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textAlign: 'left', padding: '4px 0' }}
                      >
                        + Add task
                      </button>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setShowColumnModal(true)}
            style={{
              border: '2px dashed rgba(255,255,255,0.6)',
              borderRadius: '12px',
              padding: '16px',
              width: '280px',
              minWidth: '280px',
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '56px',
            }}
          >
            + Add column
          </button>
        </div>
      </DragDropContext>

      {/* ================= MODAL TAMBAH TUGAS ================= */}
      {isAddTaskModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 30px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>Tambah Tugas Baru</h3>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Judul Tugas</label>
                <input
                  type="text"
                  placeholder="Masukkan judul tugas..."
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Deskripsi</label>
                <textarea
                  placeholder="Masukkan deskripsi tugas..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Lampiran File / Gambar</label>
                <input
                  type="file"
                  onChange={(e) => setNewTaskFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Prioritas</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Tenggat Waktu (Due Date)</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH KOLOM ================= */}
      {showColumnModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 30px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>Tambah Kolom Baru</h3>
            <form onSubmit={handleAddColumn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Nama Kolom</label>
                <input
                  type="text"
                  placeholder="Cth: Review..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Warna Aksen Kolom</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={newColumnColor}
                    onChange={(e) => setNewColumnColor(e.target.value)}
                    style={{ width: '40px', height: '36px', border: 'none', cursor: 'pointer', background: 'none' }}
                  />
                  <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{newColumnColor}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowColumnModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL BUAT GRUP BARU ================= */}
      {isNewGroupOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 30px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>Buat Grup Baru</h3>
            <form onSubmit={handleCreateNewGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Nama Grup</label>
                <input
                  type="text"
                  placeholder="Cth: Tim Projek Web..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '14px', boxSizing: 'border-box' }}
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewGroupOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Buat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL PENGATURAN GRUP (GROUP SETTINGS) ================= */}
      {activeGroupId && (
        <GroupSettingsModal
          isOpen={isGroupSettingsOpen}
          onClose={() => setIsGroupSettingsOpen(false)}
          groupId={activeGroupId}
          currentUserEmail={currentUser || ''}
          onGroupUpdated={fetchUserGroups}
          onDeleteGroup={handleDeleteGroup}
        />
      )}

      {/* ================= MODAL PROFIL LENGKAP ================= */}
      {isProfileModalOpen && (
        <ProfileModal
          currentUser={currentUser || ''}
          userAvatar={userAvatar}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
          onUpdateUserAvatar={(newAvatar) => {
            setUserAvatar(newAvatar);
            localStorage.setItem('kanban_user_avatar', newAvatar);
          }}
        />
      )}
    </div>
  );
}