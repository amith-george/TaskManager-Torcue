"use client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Calendar, Clock, GripVertical, Circle, Loader, CheckCircle2, Lock, AlertCircle } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  date: string;
  deadline: string;
  status: string;
}

interface KanbanColumnProps {
  title: string;
  id: string;
  tasks: Task[];
}

export default function KanbanColumn({ title, id, tasks }: KanbanColumnProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const isUrgentTask = (deadlineString: string) => {
    if (id === "Completed") return false; 
    const deadline = new Date(deadlineString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(today);
    tomorrowEnd.setDate(today.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    return deadline <= tomorrowEnd;
  };

  const getColumnConfig = (statusId: string) => {
    switch (statusId) {
      case "To Do":
        return {
          borderColor: "border-t-gray-400",
          icon: <Circle className="h-4 w-4 text-gray-500" />,
          bgBadge: "bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-gray-300",
          dragBg: "bg-gray-100 dark:bg-zinc-800",
        };
      case "Current":
        return {
          borderColor: "border-t-blue-500",
          icon: <Loader className="h-4 w-4 text-blue-500 animate-spin-slow" />,
          bgBadge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          dragBg: "bg-blue-50 dark:bg-blue-900/10",
        };
      case "Completed":
        return {
          borderColor: "border-t-green-500",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          bgBadge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          dragBg: "bg-green-50 dark:bg-green-900/10",
        };
      default:
        return {
          borderColor: "border-t-gray-200",
          icon: <Circle className="h-4 w-4" />,
          bgBadge: "bg-gray-200",
          dragBg: "bg-gray-50",
        };
    }
  };

  const config = getColumnConfig(id);
  const isCompletedColumn = id === "Completed";

  return (
    <div className={`flex h-[500px] md:h-[82vh] flex-col rounded-xl bg-gray-50/50 p-4 ring-1 ring-gray-200 dark:bg-zinc-900/50 dark:ring-zinc-800 border-t-4 ${config.borderColor}`}>
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            {config.icon}
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
            {title}
            </h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${config.bgBadge}`}>
          {tasks.length}
        </span>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-4 overflow-y-auto p-3 transition-all duration-200
              ${snapshot.isDraggingOver ? config.dragBg : ""} 
              rounded-lg relative`}
          >
            {/* Empty Task State */}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 dark:border-zinc-800 dark:text-zinc-600">
                    <p className="text-xs font-medium">No tasks yet</p>
                </div>
            )}

            {tasks.map((task, index) => {
              const isUrgent = isUrgentTask(task.deadline);
              
              let cardStyles = "";

              if (isCompletedColumn) {
                cardStyles = "opacity-80 bg-gray-50 ring-1 ring-gray-200 dark:bg-zinc-900/50 dark:ring-zinc-800";
              } else if (isUrgent) {
                cardStyles = "bg-red-50 ring-2 ring-red-500 shadow-sm dark:bg-red-900/10 dark:ring-red-500";
              } else {
                cardStyles = "bg-white ring-1 ring-gray-100 hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800";
              }

              return (
                <Draggable 
                  key={task._id} 
                  draggableId={task._id} 
                  index={index}
                  isDragDisabled={isCompletedColumn}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...provided.draggableProps.style }}
                      className={`group relative rounded-xl p-4 transition-all 
                        ${cardStyles} 
                        ${snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500 rotate-1 scale-105 z-50 bg-white dark:bg-zinc-800" : "hover:-translate-y-0.5"}
                      `}
                    >
                      {/* Drag Handle or Lock Icon */}
                      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                           {isCompletedColumn ? (
                              <Lock className="h-4 w-4 text-gray-400" />
                           ) : (
                              <GripVertical className="h-4 w-4 text-gray-300 cursor-grab active:cursor-grabbing" />
                           )}
                      </div>

                      <div className="pr-6"> 
                          <h4 className={`font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight ${isCompletedColumn ? "text-gray-600 dark:text-gray-400" : ""}`}>
                              {task.title}
                          </h4>
                      </div>
                      
                      <div className={`mt-3 flex items-center justify-between border-t pt-3 text-xs ${isUrgent && !isCompletedColumn ? "border-red-200 dark:border-red-900/30" : "border-gray-50 dark:border-zinc-800"}`}>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                           <Calendar className="mr-1.5 h-3.5 w-3.5" />
                           <span>{formatDate(task.date)}</span>
                        </div>
                        
                        <div className={`flex items-center font-medium ${
                          isUrgent
                            ? "text-red-600 bg-red-100 px-2 py-0.5 rounded-md dark:bg-red-900/30 dark:text-red-400" 
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                           {isUrgent ? <AlertCircle className="mr-1.5 h-3.5 w-3.5" /> : <Clock className="mr-1.5 h-3.5 w-3.5" />}
                           <span>{formatDate(task.deadline)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}