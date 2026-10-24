import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAction } from '../hooks/useAction';
import { Button, ErrorNotice, Field, PageHeading } from '../components/ui';
import { api } from '../services/api';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Account() {
  const { user, updateProfile, signOut } = useAuth();
  const { refresh } = useWorkspace();
  const profileAction = useAction();
  const passwordAction = useAction();
  const navigate = useNavigate();
  const [mismatch, setMismatch] = useState(false);

  function updateDetails(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    profileAction.run(async () => {
      await updateProfile(values);
      await refresh();
    });
  }

  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (values.newPassword !== values.confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    passwordAction.run(async () => {
      await api.patch('/auth/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      await signOut();
      navigate('/', { replace: true });
    });
  }

  return <>
    <PageHeading eyebrow="KEEP YOUR ACCOUNT SECURE" title="Your account." description="Update your profile and sign-in password."/>
    <section className="panel settings-form account-password">
      <div className="panel-heading"><div><h2>Profile details</h2><p>Keep your name and work email current.</p></div></div>
      <form onSubmit={updateDetails}>
        <ErrorNotice>{profileAction.error}</ErrorNotice>
        <Field label="Full name" name="name" defaultValue={user.name} required minLength={2} maxLength={80}/>
        <Field label="Work email" name="email" type="email" defaultValue={user.email} required/>
        <div className="modal-actions"><Button type="submit" busy={profileAction.busy}>Save profile</Button></div>
      </form>
    </section>
    <section className="panel settings-form account-password">
      <div className="panel-heading"><div><h2><KeyRound size={19}/>Change password</h2><p>Use at least 8 characters. Your existing password is required.</p></div></div>
      <form onSubmit={submit}>
        <ErrorNotice>{passwordAction.error}</ErrorNotice>
        <ErrorNotice>{mismatch ? 'The new passwords do not match.' : ''}</ErrorNotice>
        <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" required maxLength={72}/>
        <Field label="New password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={72}/>
        <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={72}/>
        <p className="form-note"><ShieldCheck size={15}/> All current sessions will be invalidated after a successful change.</p>
        <div className="modal-actions"><Button type="submit" busy={passwordAction.busy}><KeyRound size={16}/>Update password</Button></div>
      </form>
    </section>
  </>;
}
