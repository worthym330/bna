import { BlockConfig } from './types';
import { BlockItem } from './BlockItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';


interface CanvasProps {
  blocks: BlockConfig[];
  selectedId: string | null;
  onBlocksChange: (blocks: BlockConfig[]) => void;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
}

export function Canvas({ blocks, selectedId, onBlocksChange, onSelect, onRemove }: CanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires moving 5px before dragging starts to allow clicks
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center"
      onClick={() => onSelect(null)}
    >
      <div 
        className="w-[800px] max-w-full min-h-[1056px] bg-white shadow-lg rounded p-8"
        onClick={(e) => e.stopPropagation()} // Prevent deselecting when clicking empty space in canvas
      >
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          
        >
          <SortableContext 
            items={blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map((block) => (
              <BlockItem 
                key={block.id} 
                block={block} 
                isSelected={selectedId === block.id}
                onSelect={onSelect}
                onRemove={onRemove}
              />
            ))}
            
            {blocks.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400">
                <div className="text-lg font-medium mb-2">Canvas is empty</div>
                <div className="text-sm">Click a block on the right to add it here.</div>
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
