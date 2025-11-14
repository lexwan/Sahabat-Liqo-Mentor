import api from './axiosInstance';

export const getMentorDashboardStats = async () => {
  try {
    const response = await api.get('/mentor/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor dashboard stats:', error);
    throw error;
  }
};

export const getMentorStudents = async () => {
  try {
    const response = await api.get('/mentor/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    throw error;
  }
};

export const getMentorActivities = async () => {
  try {
    const response = await api.get('/mentor/activities');
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor activities:', error);
    throw error;
  }
};

export const getMentorGroups = async () => {
  try {
    const response = await api.get('/mentor/groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor groups:', error);
    throw error;
  }
};

export const getMentorGroupDetail = async (groupId) => {
  try {
    const response = await api.get(`/mentor/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group detail:', error);
    throw error;
  }
};

export const createMentorGroup = async (groupData) => {
  try {
    const response = await api.post('/mentor/groups', groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const addMentees = async (groupId, menteesData) => {
  try {
    const response = await api.post(`/mentor/groups/${groupId}/mentees`, {
      mentees: menteesData
    });
    return response.data;
  } catch (error) {
    console.error('Error adding mentees:', error);
    throw error;
  }
};



export const deleteMentee = async (menteeId) => {
  try {
    const response = await api.delete(`/mentor/mentees/${menteeId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting mentee:', error);
    throw error;
  }
};

export const addAvailableMenteesToGroup = async (groupId, menteeIds) => {
  try {
    const response = await api.patch(`/mentor/groups/${groupId}/add-mentees`, {
      mentee_ids: menteeIds
    });
    return response.data;
  } catch (error) {
    console.error('Error adding available mentees to group:', error);
    throw error;
  }
};

export const moveMenteesToGroup = async (groupId, menteeIds) => {
  try {
    const response = await api.put(`/mentor/groups/${groupId}/move-mentees`, {
      mentee_ids: menteeIds
    });
    return response.data;
  } catch (error) {
    console.error('Error moving mentees to group:', error);
    throw error;
  }
};

export const getMentorMeetings = async () => {
  try {
    const response = await api.get('/mentor/meetings');
    return response.data;
  } catch (error) {
    console.error('Error fetching mentor meetings:', error);
    throw error;
  }
};

export const getMeetingDetail = async (meetingId) => {
  try {
    const response = await api.get(`/mentor/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meeting detail:', error);
    throw error;
  }
};

export const deleteMeeting = async (meetingId) => {
  try {
    const response = await api.delete(`/mentor/meetings/${meetingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

export const getTrashedMeetings = async () => {
  try {
    const response = await api.get('/mentor/meetings/trashed');
    return response.data;
  } catch (error) {
    console.error('Error fetching trashed meetings:', error);
    throw error;
  }
};

export const restoreMeeting = async (meetingId) => {
  try {
    const response = await api.post(`/mentor/meetings/${meetingId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring meeting:', error);
    throw error;
  }
};

export const updateMeeting = async (meetingId, meetingData) => {
  try {
    if (meetingData instanceof FormData) {
      meetingData.append('_method', 'PUT');
      const response = await api.post(`/mentor/meetings/${meetingId}`, meetingData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      const response = await api.put(`/mentor/meetings/${meetingId}`, meetingData);
      return response.data;
    }
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
};

export const createMeeting = async (meetingData) => {
  try {
    const formData = new FormData();
    
    // Add basic meeting data
    formData.append('group_id', meetingData.group_id);
    formData.append('topic', meetingData.topic);
    formData.append('meeting_date', meetingData.meeting_date);
    formData.append('meeting_type', meetingData.meeting_type);
    formData.append('place', meetingData.place);
    if (meetingData.notes) {
      formData.append('notes', meetingData.notes);
    }
    
    // Add photos if any
    if (meetingData.photos && meetingData.photos.length > 0) {
      meetingData.photos.forEach((photo, index) => {
        formData.append('photos[]', photo);
      });
    }
    
    // Add attendances if any
    if (meetingData.attendances && meetingData.attendances.length > 0) {
      meetingData.attendances.forEach((attendance, index) => {
        formData.append(`attendances[${index}][mentee_id]`, attendance.mentee_id);
        formData.append(`attendances[${index}][status]`, attendance.status);
        if (attendance.note) {
          formData.append(`attendances[${index}][note]`, attendance.note);
        }
      });
    }
    
    const response = await api.post('/mentor/meetings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await api.put(`/mentor/groups/${groupId}`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

export const removeMenteeFromGroup = async (menteeId) => {
  try {
    const response = await api.patch(`/mentees/${menteeId}`, {
      group_id: null
    });
    return response.data;
  } catch (error) {
    console.error('Error removing mentee from group:', error);
    throw error;
  }
};

export const deleteGroup = async (groupId) => {
  try {
    const response = await api.delete(`/mentor/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

export const getTrashedGroups = async () => {
  try {
    const response = await api.get('/mentor/groups/trashed');
    return response.data;
  } catch (error) {
    console.error('Error fetching trashed groups:', error);
    throw error;
  }
};

export const restoreGroup = async (groupId) => {
  try {
    const response = await api.post(`/mentor/groups/${groupId}/restore`);
    return response.data;
  } catch (error) {
    console.error('Error restoring group:', error);
    throw error;
  }
};