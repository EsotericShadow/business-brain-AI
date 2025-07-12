# Current EmailDetail Component Structure

This document shows the current structure of the `EmailDetail` component in `frontend/src/components/EmailView.tsx`.

```jsx
const EmailDetail: React.FC<{email: Email}> = ({email}) => (
  <div className="email-detail-container">
    <div className="email-detail-header">
      <div className="email-header-content">
        <h2 className="email-subject-title">{email.subject}</h2>
        <div className="email-meta-info">
          From: <span className="sender-name">{email.from}</span>
        </div>
        <div className="email-timestamp">
          {new Date(email.date).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short'})}
        </div>
      </div>
    </div>
    
    <div className="email-actions-bar">
      <ActionButton label="Reply"><ArrowUturnLeftIcon className="w-4 h-4"/></ActionButton>
      <ActionButton label="Forward"><ArrowUturnRightIcon className="w-4 h-4"/></ActionButton>
      <ActionButton label="Delete" isDelete><TrashIcon className="w-4 h-4"/></ActionButton>
    </div>
    
    <div className="email-body-container">
      <div className="email-body-scroll">
        <div 
          className="email-body-content-responsive" 
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.body) }}
        />
      </div>
    </div>
  </div>
);
```
