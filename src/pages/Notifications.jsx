import { Bell, Check, CheckCheck } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAction } from '../hooks/useAction';
import { Badge, Button, Empty, ErrorNotice, PageHeading } from '../components/ui';
import './Notifications.css';

export default function Notifications() {
  const { data, mutate } = useWorkspace();
  const action = useAction();
  const unread = data.notifications.filter(notification => !notification.read).length;

  return <>
    <PageHeading eyebrow="THE LITTLE THINGS THAT KEEP US IN SYNC" title="Your notifications." description="A history of updates and reminders for your account.">
      <Button
        variant="secondary"
        disabled={!unread || action.busy}
        onClick={() => action.run(() => mutate('patch', '/notifications/read', {}, 'Notifications marked as read'))}
      ><CheckCheck size={16}/>Mark all read</Button>
    </PageHeading>
    <ErrorNotice>{action.error}</ErrorNotice>
    <section className="panel">
      <div className="table-toolbar">
        <div className="table-title"><h2>Notification history</h2><span className="count-pill">{data.notifications.length}</span></div>
        <span className="muted">{unread} unread</span>
      </div>
      {data.notifications.length ? <div className="notification-history">
        {data.notifications.map(notification => <article className={`notification-history-item ${notification.read ? 'read' : ''}`} key={notification._id}>
          <span className="stat-icon sage"><Bell size={19}/></span>
          <div className="notification-history-copy">
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
            <time dateTime={notification.createdAt}>{new Date(notification.createdAt).toLocaleString()}</time>
          </div>
          <div className="notification-history-action">
            <Badge>{notification.read ? 'Read' : 'Unread'}</Badge>
            {!notification.read && <button
              className="icon-button"
              aria-label={`Mark ${notification.title} as read`}
              disabled={action.busy}
              onClick={() => action.run(() => mutate('patch', `/notifications/${notification._id}/read`, {}, 'Notification marked as read'))}
            ><Check size={17}/></button>}
          </div>
        </article>)}
      </div> : <Empty icon={Bell} title="All caught up">New announcements and important updates will appear here.</Empty>}
    </section>
  </>;
}
