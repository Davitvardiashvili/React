import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import axiosInstance from '../axiosInstance/axiosInstance';


const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [competitionOptions, setCompetitionOptions] = useState([]);
    const [newGroup, setNewGroup] = useState({
        competition: '',
        group_name: '',
        gender: ''
    });
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editGroupData, setEditGroupData] = useState({
        competition: '',
        group_name: '',
        gender: ''
    });

    const genderOptions = [
      { id: '1', name: 'Male' },
      { id: '2', name: 'Female' }
  ]; 

    useEffect(() => {
        // Fetch competitors
        axios.get('http://localhost:8000/api/group/')
        .then(response => {
            setGroups(response.data);
        })
        .catch(error => {
            console.error("Error fetching group data:", error);
        });

        // Fetch school options
        axios.get(`http://localhost:8000/api/competition/`)
        .then(response => {
            setCompetitionOptions(response.data);
        
        })
        .catch(error => {
            console.error("Error fetching school data:", error);
        });
             
    }, []);

    const handleAddGroup = (e) => {
        e.preventDefault();

        // Updated: Use 'gender_id' and 'school_id' in the request body
        axiosInstance.post('/group/', {
            ...newGroup,
            gender_id: parseInt(newGroup.gender, 10),
            competition_id: parseInt(newGroup.competition, 10),})
        .then(response => {
            setGroups([...groups, response.data]);
            setNewGroup({ group_name: '', competition: '', gender: '' });
        })
        .catch(error => {
            console.error('Error adding Group:', error);
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewGroup(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const startEdit = (group) => {
        setEditingGroupId(group.id);
        setEditGroupData({
            group_name: group.group_name,
            gender_id: group.gender, // Ensure you use the correct field for gender ID
            competition_id: group.competition // Ensure you use the correct field for school ID
        });
    };
    
    const cancelEdit = () => {
        setEditingGroupId(null);
        setEditGroupData({ group_name: '', competition: '', gender: '' });
    };


    const handleUpdateGroup = (e) => {
        e.preventDefault();
    
        const genderId = genderOptions.find(gender => gender.name === editGroupData.gender_id)?.id
        console.log('competitionOptions -- ',competitionOptions)
        console.log('competition -- ',editGroupData.competition_id)
        let competitionId = competitionOptions.find(competition => competition.stage.season.season  + competition.stage.name + competition.discipline.discipline === editGroupData.competition_id)?.id
        if (competitionId === undefined){
          competitionId = competitionOptions.find(competition => competition.stage.season.season  + competition.stage.name + competition.discipline.discipline === editGroupData.competition_id.stage.season.season + editGroupData.competition_id.stage.name + editGroupData.competition_id.discipline.discipline)?.id
        }
        const updatedData = {
            group_name: editGroupData.group_name,
            gender_id: Number(genderId) || null,
            competition_id: Number(competitionId) || null,
        };
        // debugger
    console.log('updatedData',updatedData)
        axiosInstance.put(`/group/${editingGroupId}/`, updatedData,)
        .then(response => {
            setGroups(groups.map(group => 
                group.id === editingGroupId ? response.data : group
            ));
            cancelEdit();
        })
        .catch(error => {
            console.error('Error updating group:', error);
        });
    };

    


    const handleDeleteGroup = (groupId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this group?");
    
        if (isConfirmed) {
            axiosInstance.delete(`/group/${groupId}/`,)
            .then(() => {
                // Update the competitors state to remove the deleted competitor
                setGroups(groups.filter(group => group.id !== groupId));
            })
            .catch(error => {
                console.error('Error deleting group:', error);
            });
        }
    };

  return (
    <div className="homeTable">
        <form onSubmit={handleAddGroup}>
                <input
                    type="text"
                    name="group_name"
                    value={newGroup.group_name}
                    onChange={handleChange}
                    placeholder="Group Name"
                />

                <select
                    name="competition"
                    value={newGroup.competition}
                    onChange={handleChange}
                >
                    <option value="">Select Competition</option>
                    {competitionOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.stage.season.season} - {option.stage.name} - {option.discipline.discipline}</option>
                    ))}
                </select>
                <select
                    name="gender"
                    value={newGroup.gender}
                    onChange={handleChange}
                >
                    <option value="">Select Gender</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                </select>
                <button type="submit">Add Group</button>
            </form>
        <div className="tableHeader"><h4>Groups</h4></div>
        <table>
            <thead>
                <tr>
                    <th>id</th>
                    <th>Group</th>
                    <th>Stage</th>
                    <th>Discipline</th>
                    <th>Season</th>
                    <th>Gender</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>



            {groups.map(group => (
            <tr key={group.id}>
                <td>{group.id}</td>
                <td>
                    {editingGroupId === group.id ? (
                        <input 
                            type="text" 
                            value={editGroupData.group_name} 
                            onChange={(e) => setEditGroupData({...editGroupData, group_name: e.target.value})} 
                        />
                    ) : (
                        group.group_name
                    )}
                </td>
                <td>
                    {editingGroupId === group.id ? (
                        <select
                            value={editGroupData.competition}
                            onChange={(e) => setEditGroupData({...editGroupData, competition_id: e.target.value})}
                        >
                            {competitionOptions.map(option => (
                                <option key={option.id} value={option.stage.season.season + option.stage.name + option.discipline.discipline} selected={option.stage.season.season + option.stage.name + option.discipline.discipline === (group.competition.stage.season.season + group.competition.stage.name + group.competition.discipline.discipline)}>
                                    {console.log("group",group.competition.stage.season.season + group.competition.stage.name + group.competition.discipline.discipline)}
                                    {console.log("option",option.stage.season.season + option.stage.name + option.discipline.discipline)}

                                    {option.stage.season.season} - {option.stage.name} - {option.discipline.discipline}
                                </option>
                            ))}
                        </select>
                    ) : (
                        group.competition.stage.name // Ensure this shows a meaningful representation of the school
                    )}
                </td>
                <td>{group.competition.discipline.discipline}</td>
                <td>{group.competition.stage.season.season}</td>
                <td>
                    {editingGroupId === group.id ? (
                        <select
                            value={editGroupData.gender}
                            onChange={(e) => setEditGroupData({...editGroupData, gender_id: e.target.value})}>
                            {genderOptions.map(option => (
                                <option key={option.id} value={option.name} selected={option.name === (group.gender)}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        group.gender
                    )}
                </td>

                <td>
                    {editingGroupId === group.id ? (
                        <>
                            <button onClick={handleUpdateGroup}>save</button>
                            <button onClick={cancelEdit}>cancel</button>
                        </>
                    ) : (
                        <button onClick={() => startEdit(group)}>edit</button>
                    )}
                </td>
                <td>
                    <button onClick={() => handleDeleteGroup(group.id)}>delete</button>
                </td>
            </tr>
            ))}
            </tbody>
        </table>
      </div>
    
  );
};

export default Groups;