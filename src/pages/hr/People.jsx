import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Download, Users, ArrowUpRight, Mail, Building2, CalendarDays, Phone, MapPin, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAction } from '../../hooks/useAction';
import { Avatar, Badge, Button, Empty, ErrorNotice, Field, Modal, PageHeading, formatDate } from '../../components/ui';
import { exportCsv } from '../../services/api';

export default function People() {
  const { user } = useAuth();
  const { data, mutate } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const action = useAction();
  const query = params.get('q') || '';
  const adding = params.get('new') === '1';
  const isAdmin = user.role === 'admin';
  const canEditPeople = user.role === 'admin' || user.role === 'hr';
  const dept = id => data.departments.find(item => item._id === id)?.name || 'Unassigned';
  const people = data.employees.filter(employee =>
    (department === 'all' || employee.departmentId === department) &&
    (status === 'all' || employee.status === status) &&
    `${employee.name} ${employee.email} ${employee.designation} ${dept(employee.departmentId)}`.toLowerCase().includes(query.toLowerCase()),
  );

  function close() {
    setSelected(null);
    setParams(current => {
      current.delete('new');
      return current;
    });
    action.setError('');
  }

  function create(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    if (isAdmin) {
      payload.baseSalary = Number(payload.baseSalary);
      payload.allowance = Number(payload.allowance);
    }
    action.run(async () => {
      await mutate('post', '/employees', payload, 'Your new teammate is ready to go');
      close();
    });
  }

  function save(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    if (isAdmin) {
      payload.baseSalary = Number(payload.baseSalary);
      payload.allowance = Number(payload.allowance);
    } else {
      delete payload.status;
    }
    action.run(async () => {
      await mutate('patch', `/employees/${selected._id}`, payload, 'Employee details updated');
      close();
    });
  }

  function fireEmployee() {
    if (!selected || selected.userId === user._id || !window.confirm(
      `Permanently delete ${selected.name}? This erases their account and profile, attendance, leave, payroll/payslips, notifications, assistant and audit history, and announcements they authored. This cannot be undone.`,
    )) return;
    action.run(async () => {
      await mutate('delete', `/employees/${selected._id}`, undefined, 'Employee and associated records permanently deleted');
      close();
    });
  }

  return <>
    <PageHeading eyebrow="GOOD PEOPLE. GREAT POSSIBILITIES." title="Your people." description="Get to know the people who make it all happen.">
      <Button
        variant="secondary"
        disabled={!people.length}
        onClick={() => exportCsv('employees.csv', people.map(employee => ({
          name: employee.name,
          email: employee.email,
          department: dept(employee.departmentId),
          designation: employee.designation,
          joined: employee.joinDate,
          status: employee.status,
        })))}
      ><Download size={16}/>Export</Button>
      <Button onClick={() => setParams(current => { current.set('new', '1'); return current; })}>
        <Plus size={17}/>Add employee
      </Button>
    </PageHeading>

    <section className="panel">
      <div className="table-toolbar">
        <div className="table-title"><h2>Employee directory</h2><span className="count-pill">{people.length}</span></div>
        <div className="filters">
          <div className="search-input">
            <Search size={17}/>
            <input
              aria-label="Search employees"
              value={query}
              onChange={event => setParams(current => { current.set('q', event.target.value); return current; })}
              placeholder="Search name, role, or team…"
            />
          </div>
          <select aria-label="Filter department" value={department} onChange={event => setDepartment(event.target.value)}>
            <option value="all">All departments</option>
            {data.departments.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
          <select aria-label="Filter employee status" value={status} onChange={event => setStatus(event.target.value)}>
            <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Employee</th><th>Department</th><th>Job title</th><th>Joined</th><th>Status</th><th><span className="sr-only">Details</span></th></tr></thead>
          <tbody>{people.map(employee => <tr key={employee._id}>
            <td><div className="person-cell"><Avatar name={employee.name} color={employee.avatarColor}/><div><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td>
            <td><span className="department-tag">{dept(employee.departmentId)}</span></td>
            <td>{employee.designation}</td>
            <td className="muted">{formatDate(employee.joinDate)}</td>
            <td><Badge>{employee.status}</Badge></td>
            <td><button className="icon-button" aria-label={`View ${employee.name}`} onClick={() => setSelected(employee)}><ArrowUpRight size={18}/></button></td>
          </tr>)}</tbody>
        </table>
      </div>
      {!people.length && <Empty icon={Users} title={query ? 'No teammates found' : 'Your team starts here'}>
        {query ? 'Try a different name, role, or department.' : 'Create a department, then add your first employee.'}
      </Empty>}
      <div className="table-footer"><span>Showing {people.length} of {data.employees.length} employees</span><span>Good people, all in one place.</span></div>
    </section>

    {adding && <Modal title="Make room for someone great." description="Create an employee profile and their sign-in account." onClose={close} wide>
      <form onSubmit={create}>
        <ErrorNotice>{action.error}</ErrorNotice>
        <div className="form-grid">
          <Field label="Full name" name="name" placeholder="e.g. Sara Ahmed" required minLength={2} maxLength={80}/>
          <Field label="Work email" name="email" type="email" placeholder="sara@company.com" required/>
          <Field label="Phone" name="phone" type="tel" maxLength={40}/>
          <Field label="Address" name="address" maxLength={300}/>
          <Field label="Emergency contact" name="emergencyContact" maxLength={120}/>
          <Field label="Department"><select name="departmentId" required defaultValue=""><option value="" disabled>Select a department</option>{data.departments.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select></Field>
          <Field label="Job title" name="designation" placeholder="e.g. Product Designer" required minLength={2} maxLength={80}/>
          <Field label="Joining date" name="joinDate" type="date" required defaultValue={data.today}/>
          <Field label="Employment type"><select name="employmentType"><option>Full-time</option><option>Part-time</option><option>Contract</option></select></Field>
          {isAdmin && <>
            <Field label={`Monthly base salary (${data.company.currency})`} name="baseSalary" type="number" min="0" max="100000000" step="0.01" defaultValue="0" required/>
            <Field label="Monthly allowance" name="allowance" type="number" min="0" max="10000000" step="0.01" defaultValue="0"/>
            <Field label="Workspace role"><select name="role"><option value="employee">Employee</option><option value="hr">HR manager</option></select></Field>
          </>}
          <Field label="Temporary password" name="password" type="password" required minLength={8} maxLength={72} placeholder="At least 8 characters" autoComplete="new-password"/>
        </div>
        <div className="form-note">Share sign-in details privately. {user.role === 'hr' ? 'An administrator must set compensation before payroll.' : ''}</div>
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
          <Button busy={action.busy} type="submit" disabled={!data.departments.length}>Add to the team<Plus size={16}/></Button>
        </div>
      </form>
    </Modal>}

    {selected && <Modal title="Employee profile" onClose={close} wide>
      <div className="employee-profile">
        <Avatar name={selected.name} color={selected.avatarColor}/>
        <h2>{selected.name}</h2>
        <p>{selected.designation} <span>·</span> {selected.employeeCode}</p>
        <Badge>{selected.status}</Badge>
      </div>
      <div className="profile-details">
        <div><Mail size={16}/>{selected.email}</div>
        {selected.phone && <div><Phone size={16}/>{selected.phone}</div>}
        {selected.address && <div><MapPin size={16}/>{selected.address}</div>}
        <div><Building2 size={16}/>{dept(selected.departmentId)}</div>
        <div><CalendarDays size={16}/>Joined {formatDate(selected.joinDate)}</div>
        {selected.emergencyContact && <div>Emergency contact: {selected.emergencyContact}</div>}
      </div>
      {canEditPeople && <form onSubmit={save}>
        <ErrorNotice>{action.error}</ErrorNotice>
        <div className="form-grid">
          <Field label="Full name" name="name" defaultValue={selected.name} required minLength={2} maxLength={80}/>
          <Field label="Work email" name="email" type="email" defaultValue={selected.email} required/>
          <Field label="Phone" name="phone" type="tel" defaultValue={selected.phone || ''} maxLength={40}/>
          <Field label="Address" name="address" defaultValue={selected.address || ''} maxLength={300}/>
          <Field label="Emergency contact" name="emergencyContact" defaultValue={selected.emergencyContact || ''} maxLength={120}/>
          <Field label="Department"><select name="departmentId" defaultValue={selected.departmentId} required>{data.departments.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select></Field>
          <Field label="Job title" name="designation" defaultValue={selected.designation} required minLength={2} maxLength={80}/>
          <Field label="Employment type"><select name="employmentType" defaultValue={selected.employmentType || 'Full-time'}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></Field>
          {isAdmin && <>
            <Field label="Monthly base salary" name="baseSalary" type="number" min="0" max="100000000" step="0.01" defaultValue={selected.baseSalary} required/>
            <Field label="Allowance" name="allowance" type="number" min="0" max="10000000" step="0.01" defaultValue={selected.allowance || 0} required/>
            <Field label="Account status"><select name="status" defaultValue={selected.status}><option value="active">Active</option><option value="inactive">Inactive — disables sign-in</option></select></Field>
          </>}
        </div>
        {isAdmin && <p className="form-note">Compensation changes apply to future payroll generation. Existing payslips remain unchanged.</p>}
        <div className="modal-actions">
          {isAdmin && selected.userId !== user._id && <Button type="button" variant="danger" disabled={action.busy} onClick={fireEmployee}><Trash2 size={16}/>Fire &amp; permanently delete</Button>}
          <Button type="submit" busy={action.busy}>Save changes</Button>
        </div>
      </form>}
    </Modal>}
  </>;
}
