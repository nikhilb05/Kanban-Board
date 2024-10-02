import './index.css';
import React, { useState, useEffect } from 'react';
import { Camera, User, AlertCircle } from 'lucide-react';

const priorityIcons = {
  4: <AlertCircle size={16} color="red" />,
  3: <AlertCircle size={16} color="orange" />,
  2: <AlertCircle size={16} color="yellow" />,
  1: <AlertCircle size={16} color="blue" />,
  0: <AlertCircle size={16} color="gray" />,
};

const priorityLabels = {
  4: 'Urgent',
  3: 'High',
  2: 'Medium',
  1: 'Low',
  0: 'No priority',
};

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const savedState = localStorage.getItem('kanbanState');
    if (savedState) {
      const { grouping, sorting } = JSON.parse(savedState);
      setGrouping(grouping);
      setSorting(sorting);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanbanState', JSON.stringify({ grouping, sorting }));
  }, [grouping, sorting]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
      const data = await response.json();
      setTickets(data.tickets);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const groupTickets = () => {
    let grouped = {};
    if (grouping === 'status') {
      grouped = tickets.reduce((acc, ticket) => {
        (acc[ticket.status] = acc[ticket.status] || []).push(ticket);
        return acc;
      }, {});
    } else if (grouping === 'user') {
      grouped = tickets.reduce((acc, ticket) => {
        const user = users.find(u => u.id === ticket.userId);
        (acc[user.name] = acc[user.name] || []).push(ticket);
        return acc;
      }, {});
    } else if (grouping === 'priority') {
      grouped = tickets.reduce((acc, ticket) => {
        (acc[priorityLabels[ticket.priority]] = acc[priorityLabels[ticket.priority]] || []).push(ticket);
        return acc;
      }, {});
    }
    return grouped;
  };

  const sortTickets = (ticketsToSort) => {
    return ticketsToSort.sort((a, b) => {
      if (sorting === 'priority') {
        return b.priority - a.priority;
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  };

  const groupedTickets = groupTickets();

  return (
    <div className="kanban-board">
      <div className="header">
        <div className="dropdown">
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="dropdown-toggle">
            Display <span>▼</span>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div>
                <label>Grouping</label>
                <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
                  <option value="status">Status</option>
                  <option value="user">User</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              <div>
                <label>Ordering</label>
                <select value={sorting} onChange={(e) => setSorting(e.target.value)}>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="board">
        {Object.entries(groupedTickets).map(([group, groupTickets]) => (
          <div key={group} className="column">
            <h2>{group} ({groupTickets.length})</h2>
            {sortTickets(groupTickets).map((ticket) => (
              <div key={ticket.id} className="card">
                <div className="card-header">
                  <span>{ticket.id}</span>
                  {grouping !== 'user' && (
                    <span className="user-avatar">
                      <User size={16} />
                      {users.find(u => u.id === ticket.userId)?.name}
                    </span>
                  )}
                </div>
                <div className="card-title">
                  {grouping !== 'status' && <span className="status-icon"></span>}
                  {ticket.title}
                </div>
                <div className="card-footer">
                  {grouping !== 'priority' && (
                    <span className="priority-icon">
                      {priorityIcons[ticket.priority]}
                    </span>
                  )}
                  <span className="feature-request">
                    <Camera size={16} />
                    Feature Request
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
