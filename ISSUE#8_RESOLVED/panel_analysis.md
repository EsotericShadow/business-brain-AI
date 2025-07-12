# Analysis of Panel Components in Workspace.tsx

This document breaks down the usage of `react-resizable-panels` in `frontend/src/Workspace.tsx` as requested.

## 1. `PanelGroup` Component Usage

The `PanelGroup` is the top-level container for the resizable layout. It's configured for horizontal resizing and saves its state to local storage to persist the user's layout preferences.

```jsx
<PanelGroup direction="horizontal" autoSaveId="mainLayout">
  {/* Panel components go here */}
</PanelGroup>
```

## 2. `Panel` Components for Chat and Workspace

There are two `Panel` components inside the `PanelGroup`:

-   **Chat Panel:** This panel contains the chat interface.
-   **Workspace Panel:** This panel contains the tabbed workspace area (Directory, Emails, etc.).

A `PanelResizeHandle` is placed between them to allow the user to adjust their relative widths.

```jsx
<Panel defaultSize={50} minSize={30}>
  {/* Chat Panel Content */}
</Panel>
<PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-brand-500 transition-colors" />
<Panel defaultSize={50} minSize={30}>
  {/* Workspace Panel Content */}
</Panel>
```

## 3. `main` and `aside` Elements

-   The **Chat Panel** contains a `<main>` element.
-   The **Workspace Panel** contains an `<aside>` element.

These semantic tags wrap the primary content of each panel.

## 4. Current CSS Classes and Full Code Block

Here is the complete code block showing the components and their current CSS classes.

-   **Chat `<main>` element classes:** `flex flex-col h-full w-full min-w-0 bg-white dark:bg-gray-800`
-   **Workspace `<aside>` element classes:** `flex flex-col h-full w-full min-w-0 bg-gray-50 dark:bg-gray-900`

The key class here is `min-w-0`, which is crucial for preventing the content of the panels from forcing the panels themselves to expand.

### Relevant Code from `Workspace.tsx`:

```jsx
<div className="hidden md:flex flex-1 overflow-hidden">
  <PanelGroup direction="horizontal" autoSaveId="mainLayout">
    <Panel defaultSize={50} minSize={30}>
      <main className="flex flex-col h-full w-full min-w-0 bg-white dark:bg-gray-800">
        <div className="flex-1 overflow-y-auto">
          <ChatWindow messages={messages} isLoading={isLoading} onEmailSelect={() => {}} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <InputField onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>
    </Panel>
    <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-brand-500 transition-colors" />
    <Panel defaultSize={50} minSize={30}>
      <aside className="flex flex-col h-full w-full min-w-0 bg-gray-50 dark:bg-gray-900">
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <nav className="-mb-px flex space-x-2 px-4 overflow-x-auto">
            <TabButton tab="directory" label="Directory"><FolderIcon className="w-5 h-5"/></TabButton>
            <TabButton tab="emails" label="Emails"><EnvelopeIcon className="w-5 h-5"/></TabButton>
            <TabButton tab="media" label="Images/Videos"><PhotoIcon className="w-5 h-5"/></TabButton>
            <TabButton tab="calendar" label="Calendar"><CalendarDaysIcon className="w-5 h-5"/></TabButton>
          </nav>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'directory' && (
            activeFile ? (
              <FileViewer file={activeFile} onClose={() => setActiveFileId(null)} onUpdateContent={handleUpdateFileContent} />
            ) : (
              <Directory
                items={itemsInCurrentDir}
                breadcrumbs={breadcrumbs}
                selectedItemIds={selectedItemIds}
                clipboard={clipboard}
                cutItemIds={clipboard?.mode === 'cut' ? new Set(clipboard.itemIds) : new Set()}
                onNavigate={handleNavigate}
                onOpenItem={handleOpenItem}
                onToggleVisibility={handleToggleVisibility}
                onSetSelectedItemIds={setSelectedItemIds}
                onCreate={handleCreate}
                onDelete={handleDelete}
                onCut={handleCut}
                onCopy={handleCopy}
                onPaste={handlePaste}
                onDownload={handleDownload}
              />
            )
          )}
          {activeTab === 'emails' && <EmailView />}
          {activeTab === 'media' && <MediaView mediaItems={media} onOpenViewer={handleOpenMediaViewer} />}
          {activeTab === 'calendar' && <CalendarView events={calendarEvents} />}
        </div>
      </aside>
    </Panel>
  </PanelGroup>
</div>
```
