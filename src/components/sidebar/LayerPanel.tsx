import { useState, useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { SidebarSection } from './SidebarSection';
import {
  Smartphone,
  Type,
  Image,
  Square,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
  Group,
  Ungroup,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import type { CanvasElement } from '@/store/types';
import { devices } from '@/lib/devices';

function getElementLabel(element: CanvasElement): string {
  switch (element.type) {
    case 'device-frame':
      return devices[element.device]?.label ?? element.device;
    case 'text': {
      const plain = element.content.replace(/<[^>]*>/g, '').trim();
      return plain.length > 20 ? plain.slice(0, 20) + '…' : plain || 'Text';
    }
    case 'image':
      return 'Image';
    case 'shape':
      return element.shapeType.charAt(0).toUpperCase() + element.shapeType.slice(1);
  }
}

function getElementIcon(element: CanvasElement) {
  switch (element.type) {
    case 'device-frame':
      return <Smartphone size={12} />;
    case 'text':
      return <Type size={12} />;
    case 'image':
      return <Image size={12} />;
    case 'shape':
      return <Square size={12} />;
  }
}

// Group color palette for visual distinction
const GROUP_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

function getGroupColor(index: number): string {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}

export function LayerPanel() {
  const project = useProjectStore((s) => s.project);
  const selectedElementIds = useProjectStore((s) => s.selectedElementIds);
  const selectElement = useProjectStore((s) => s.selectElement);
  const toggleSelectElement = useProjectStore((s) => s.toggleSelectElement);
  const updateBaseElement = useProjectStore((s) => s.updateBaseElement);
  const removeElement = useProjectStore((s) => s.removeElement);
  const reorderElementZIndices = useProjectStore((s) => s.reorderElementZIndices);
  const groupSelectedElements = useProjectStore((s) => s.groupSelectedElements);
  const ungroupSelectedElements = useProjectStore((s) => s.ungroupSelectedElements);
  const editingGroupId = useProjectStore((s) => s.editingGroupId);
  const enterGroup = useProjectStore((s) => s.enterGroup);

  const screenshots = project.screenshotsByPlatform[project.platform] ?? [];
  const selectedScreenshot = screenshots.find((s) => s.id === project.selectedScreenshotId);

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Drag state — supports both single elements and groups
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [dragOverPos, setDragOverPos] = useState<'above' | 'below'>('above');

  // Build group lookup: elementId → groupId
  const groups = selectedScreenshot?.groups ?? {};
  const elementToGroup = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [groupId, memberIds] of Object.entries(groups)) {
      for (const id of memberIds) {
        map[id] = groupId;
      }
    }
    return map;
  }, [groups]);

  // Stable group index for coloring
  const groupColorIndex = useMemo(() => {
    const map: Record<string, number> = {};
    Object.keys(groups).forEach((gid, i) => { map[gid] = i; });
    return map;
  }, [groups]);

  if (!selectedScreenshot) return null;

  // Sort by zIndex descending (top layer first in visual list)
  const sortedElements = [...selectedScreenshot.elements].sort((a, b) => b.zIndex - a.zIndex);

  if (sortedElements.length === 0) return null;

  // Build display items: group headers + elements, with collapsing
  type DisplayItem =
    | { kind: 'group-header'; groupId: string; memberCount: number; collapsed: boolean }
    | { kind: 'element'; element: CanvasElement; groupId: string | null; indented: boolean };

  const displayItems: DisplayItem[] = [];
  const renderedGroups = new Set<string>();

  for (const element of sortedElements) {
    const groupId = elementToGroup[element.id];
    if (groupId) {
      if (!renderedGroups.has(groupId)) {
        renderedGroups.add(groupId);
        const members = groups[groupId] ?? [];
        const collapsed = collapsedGroups.has(groupId);
        displayItems.push({ kind: 'group-header', groupId, memberCount: members.length, collapsed });
        if (!collapsed) {
          // Add all group members in z-order
          const groupElements = sortedElements.filter((el) => elementToGroup[el.id] === groupId);
          for (const gel of groupElements) {
            displayItems.push({ kind: 'element', element: gel, groupId, indented: true });
          }
        }
      }
      // Skip individual rendering — handled above
    } else {
      displayItems.push({ kind: 'element', element, groupId: null, indented: false });
    }
  }

  const toggleCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const selectGroupMembers = (groupId: string) => {
    const memberIds = groups[groupId] ?? [];
    if (memberIds.length > 0) {
      // Select first member — store auto-selects all group members
      selectElement(memberIds[0]);
    }
  };

  const canGroup = selectedElementIds.length >= 2;
  const canUngroup = selectedElementIds.some((id) => !!elementToGroup[id]);

  // --- Element drag handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    setDraggedGroupId(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  // --- Group drag handlers ---
  const handleGroupDragStart = (e: React.DragEvent, groupId: string) => {
    setDraggedGroupId(groupId);
    setDraggedId(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `group:${groupId}`);
  };

  const handleDragOverElement = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id === draggedId) return;
    // Don't allow dropping on members of the dragged group
    if (draggedGroupId && elementToGroup[id] === draggedGroupId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverId(id);
    setDragOverGroupId(null);
    setDragOverPos(e.clientY < midY ? 'above' : 'below');
  };

  const handleDragOverGroup = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (groupId === draggedGroupId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverGroupId(groupId);
    setDragOverId(null);
    setDragOverPos(e.clientY < midY ? 'above' : 'below');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const currentOrder = sortedElements.map((el) => el.id);

    if (draggedGroupId) {
      // --- Dragging a group ---
      const memberIds = groups[draggedGroupId] ?? [];
      if (memberIds.length === 0) { resetDragState(); return; }

      // Find the drop target position in the currentOrder
      let insertBeforeIndex: number;
      if (dragOverGroupId) {
        // Dropping on another group header — find the first member of that group in the order
        const targetMembers = groups[dragOverGroupId] ?? [];
        const targetMemberIndices = targetMembers.map((id) => currentOrder.indexOf(id)).filter((i) => i !== -1);
        if (targetMemberIndices.length === 0) { resetDragState(); return; }
        if (dragOverPos === 'above') {
          insertBeforeIndex = Math.min(...targetMemberIndices);
        } else {
          insertBeforeIndex = Math.max(...targetMemberIndices) + 1;
        }
      } else if (dragOverId) {
        // Dropping on an individual element
        const targetIndex = currentOrder.indexOf(dragOverId);
        if (targetIndex === -1) { resetDragState(); return; }
        insertBeforeIndex = dragOverPos === 'above' ? targetIndex : targetIndex + 1;
      } else {
        resetDragState(); return;
      }

      // Remove all group members from order, then insert them contiguously at target
      const orderWithoutGroup = currentOrder.filter((id) => !memberIds.includes(id));
      // Group members sorted by their current z-order (descending in display = first in currentOrder is highest z)
      const groupMembersInOrder = currentOrder.filter((id) => memberIds.includes(id));

      // Adjust insert index for removed items before it
      let adjustedInsert = insertBeforeIndex;
      for (const id of memberIds) {
        const idx = currentOrder.indexOf(id);
        if (idx !== -1 && idx < insertBeforeIndex) adjustedInsert--;
      }
      adjustedInsert = Math.max(0, Math.min(adjustedInsert, orderWithoutGroup.length));

      // Insert group members contiguously
      orderWithoutGroup.splice(adjustedInsert, 0, ...groupMembersInOrder);

      const ascendingOrder = [...orderWithoutGroup].reverse();
      reorderElementZIndices(ascendingOrder);
    } else if (draggedId) {
      // --- Dragging a single element ---
      let insertBeforeIndex: number;
      if (dragOverGroupId) {
        // Dropping on a group header
        const targetMembers = groups[dragOverGroupId] ?? [];
        const targetMemberIndices = targetMembers.map((id) => currentOrder.indexOf(id)).filter((i) => i !== -1);
        if (targetMemberIndices.length === 0) { resetDragState(); return; }
        if (dragOverPos === 'above') {
          insertBeforeIndex = Math.min(...targetMemberIndices);
        } else {
          insertBeforeIndex = Math.max(...targetMemberIndices) + 1;
        }
      } else if (dragOverId) {
        if (draggedId === dragOverId) { resetDragState(); return; }
        const targetIndex = currentOrder.indexOf(dragOverId);
        if (targetIndex === -1) { resetDragState(); return; }
        insertBeforeIndex = dragOverPos === 'above' ? targetIndex : targetIndex + 1;
      } else {
        resetDragState(); return;
      }

      const draggedIndex = currentOrder.indexOf(draggedId);
      if (draggedIndex === -1) { resetDragState(); return; }

      const newOrder = currentOrder.filter((id) => id !== draggedId);
      const adjustedInsert = draggedIndex < insertBeforeIndex ? insertBeforeIndex - 1 : insertBeforeIndex;
      newOrder.splice(Math.min(adjustedInsert, newOrder.length), 0, draggedId);

      const ascendingOrder = [...newOrder].reverse();
      reorderElementZIndices(ascendingOrder);
    }

    resetDragState();
  };

  const resetDragState = () => {
    setDraggedId(null);
    setDraggedGroupId(null);
    setDragOverId(null);
    setDragOverGroupId(null);
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  return (
    <SidebarSection title="Layers">
      {/* Group / Ungroup buttons */}
      {(canGroup || canUngroup) && (
        <div className="mb-2 flex items-center gap-1">
          {canGroup && (
            <button
              onClick={groupSelectedElements}
              className="flex items-center gap-1 rounded-md bg-surface-700 px-2 py-1 text-[10px] font-medium text-white/60 hover:text-white hover:bg-surface-600 transition-colors"
              title="Group selected (⌘G)"
            >
              <Group size={11} />
              Group
            </button>
          )}
          {canUngroup && (
            <button
              onClick={ungroupSelectedElements}
              className="flex items-center gap-1 rounded-md bg-surface-700 px-2 py-1 text-[10px] font-medium text-white/60 hover:text-white hover:bg-surface-600 transition-colors"
              title="Ungroup (⌘⇧G)"
            >
              <Ungroup size={11} />
              Ungroup
            </button>
          )}
        </div>
      )}

      <div className="space-y-0">
        {displayItems.map((item, idx) => {
          if (item.kind === 'group-header') {
            const color = getGroupColor(groupColorIndex[item.groupId] ?? 0);
            const memberIds = groups[item.groupId] ?? [];
            const memberEls = selectedScreenshot.elements.filter((e) => memberIds.includes(e.id));
            const allVisible = memberEls.every((e) => e.visible);
            const allLocked = memberEls.every((e) => e.locked);
            const isGroupDragged = draggedGroupId === item.groupId;
            const showGroupInsertAbove = dragOverGroupId === item.groupId && dragOverPos === 'above' && draggedGroupId !== item.groupId;
            const showGroupInsertBelow = dragOverGroupId === item.groupId && dragOverPos === 'below' && draggedGroupId !== item.groupId;
            return (
              <div key={`group-${item.groupId}`}>
                {showGroupInsertAbove && (
                  <div className="h-0.5 mx-1 bg-accent rounded-full" />
                )}
                <div
                  draggable
                  onDragStart={(e) => handleGroupDragStart(e, item.groupId)}
                  onDragOver={(e) => handleDragOverGroup(e, item.groupId)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  className={`group/hdr flex items-center gap-1 rounded-lg px-1 py-1 cursor-pointer hover:bg-surface-700 transition-colors ${isGroupDragged ? 'opacity-40' : ''} ${editingGroupId === item.groupId ? 'ring-1 ring-indigo-500/40' : ''}`}
                  onClick={() => selectGroupMembers(item.groupId)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    enterGroup(item.groupId);
                    // Select first member individually
                    if (memberIds.length > 0) {
                      selectElement(memberIds[0]);
                    }
                  }}
                >
                  {/* Drag handle */}
                  <span className="shrink-0 cursor-grab text-white/20 group-hover/hdr:text-white/40">
                    <GripVertical size={10} />
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCollapse(item.groupId); }}
                    className="shrink-0 text-white/40 hover:text-white/70 p-0.5"
                  >
                    {item.collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                  </button>
                <div className="w-1 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <Group size={11} className="shrink-0 text-white/40" />
                <span className="flex-1 text-[10px] font-medium text-white/50">
                  Group ({item.memberCount})
                </span>
                {/* Group-level hide/lock — visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover/hdr:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newVisible = !allVisible;
                      memberIds.forEach((id) => updateBaseElement(id, { visible: newVisible }));
                    }}
                    className={`rounded p-0.5 hover:bg-surface-600 ${allVisible ? 'text-white/30 hover:text-white/70' : 'text-yellow-400/60 hover:text-yellow-400'}`}
                    title={allVisible ? 'Hide group' : 'Show group'}
                  >
                    {allVisible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newLocked = !allLocked;
                      memberIds.forEach((id) => updateBaseElement(id, { locked: newLocked }));
                    }}
                    className={`rounded p-0.5 hover:bg-surface-600 ${allLocked ? 'text-orange-400/60 hover:text-orange-400' : 'text-white/30 hover:text-white/70'}`}
                    title={allLocked ? 'Unlock group' : 'Lock group'}
                  >
                    {allLocked ? <Lock size={10} /> : <Unlock size={10} />}
                  </button>
                </div>
              </div>
              {showGroupInsertBelow && (
                <div className="h-0.5 mx-1 bg-accent rounded-full" />
              )}
            </div>
            );
          }

          const { element, groupId, indented } = item;
          const isSelected = selectedElementIds.includes(element.id);
          const isDragged = draggedId === element.id;
          const showInsertAbove = dragOverId === element.id && dragOverPos === 'above' && draggedId !== element.id;
          const showInsertBelow = dragOverId === element.id && dragOverPos === 'below' && draggedId !== element.id;
          const groupColor = groupId ? getGroupColor(groupColorIndex[groupId] ?? 0) : null;

          return (
            <div key={element.id}>
              {/* Insert indicator above */}
              {showInsertAbove && (
                <div className="h-0.5 mx-1 bg-accent rounded-full" />
              )}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, element.id)}
                onDragOver={(e) => handleDragOverElement(e, element.id)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                  if (e.shiftKey) {
                    toggleSelectElement(element.id);
                  } else {
                    selectElement(element.id);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (groupId && editingGroupId !== groupId) {
                    // Double-click member row → enter group, select this element
                    enterGroup(groupId);
                    selectElement(element.id);
                  }
                }}
                className={`group flex items-center gap-1 rounded-lg py-1.5 cursor-pointer transition-colors ${
                  indented ? 'pl-4 pr-1' : 'px-1'
                } ${
                  isSelected
                    ? 'bg-accent/20 ring-1 ring-accent/40'
                    : 'hover:bg-surface-700'
                } ${isDragged ? 'opacity-40' : ''}`}
                style={groupColor ? { borderLeft: `2px solid ${groupColor}` } : undefined}
              >
                {/* Drag handle */}
                <span className="shrink-0 cursor-grab text-white/20 group-hover:text-white/40">
                  <GripVertical size={10} />
                </span>

                {/* Type icon */}
                <span className={`shrink-0 ${element.visible ? 'text-white/50' : 'text-white/20'}`}>
                  {getElementIcon(element)}
                </span>

                {/* Label */}
                <span
                  className={`flex-1 truncate text-[11px] ${
                    element.visible ? 'text-white/70' : 'text-white/30 line-through'
                  } ${element.locked ? 'italic' : ''}`}
                >
                  {getElementLabel(element)}
                </span>

                {/* Action buttons — visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); updateBaseElement(element.id, { visible: !element.visible }); }}
                    className={`rounded p-0.5 hover:bg-surface-600 ${element.visible ? 'text-white/30 hover:text-white/70' : 'text-yellow-400/60 hover:text-yellow-400'}`}
                    title={element.visible ? 'Hide' : 'Show'}
                  >
                    {element.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateBaseElement(element.id, { locked: !element.locked }); }}
                    className={`rounded p-0.5 hover:bg-surface-600 ${element.locked ? 'text-orange-400/60 hover:text-orange-400' : 'text-white/30 hover:text-white/70'}`}
                    title={element.locked ? 'Unlock' : 'Lock'}
                  >
                    {element.locked ? <Lock size={10} /> : <Unlock size={10} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                    className="rounded p-0.5 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
              {/* Insert indicator below */}
              {showInsertBelow && (
                <div className="h-0.5 mx-1 bg-accent rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </SidebarSection>
  );
}
