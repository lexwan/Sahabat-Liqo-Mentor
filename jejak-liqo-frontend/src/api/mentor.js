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
    const response = await api.post('/mentor/meetings', meetingData);
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