"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getTasks, crateTask, updateTask } from '@/api/task'
import TaskModal from '@/components/TaskModal'
import moment from 'moment'

import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales: { 'pt-BR': ptBR },
})

export default function Calendario() {

    const [tasks, setTasks] = useState<any>([])
    const [modal, setModal] = useState({ toggle: false, content: {} })

    const getTasksContent = useCallback(async () => {
        const tasks: any = await getTasks({})
        setTasks(tasks.content?.map((data) => ({
            id: data.id,
            title: data.titulo,
            description: data.descricao,
            status: data.situacao,
            priority: data.prioridade,
            date: moment(data.data_vencimento).utc().format("YYYY-MM-DD"),
            start: moment(data.data_vencimento).toDate(),
            end: moment(data.data_vencimento).toDate(),
        })))
    }, [])

    useEffect(() => {
        getTasksContent()
    }, [getTasksContent])

    const saveTask = async (data: any) => {
        if (data.id) {
            await updateTask(data.id, {
                title: data.title,
                description: data.description,
                date: data.date,
                status: data.status,
                priority: data.priority,
            })
        } else {
            await crateTask({
                title: data.title,
                description: data.description,
                date: data.date,
                status: data.status,
                priority: data.priority,
                idUser: 1,
            })
        }

        await getTasksContent()
    }

    const handleSelectSlot = ({ start }: any) => {
        setModal({ toggle: true, content: { date: moment(start).utc().format("YYYY-MM-DD") } })
    }

    const handleSelectEvent = (event: any) => {
        setModal({ toggle: true, content: event })
    }
    
    return (
        <div 
            style={{ 
                height: '100vh', 
                padding: '20px', 
                background: "#fff" 
            }}
        >
            {!!modal.toggle && 
                <TaskModal
                    task={modal.content}
                    onClose={() => setModal({ toggle: false, content: {} })}
                    onSave={async (task) => {
                        await saveTask(task);
                        setModal({ toggle: false, content: {} });
                }}
            />}
            <Calendar
                selectable
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                localizer={localizer}
                events={tasks}
                startAccessor="start"
                endAccessor="end"
                culture="pt-BR"
                eventPropGetter={(event) => {
                    return {
                        style: {
                            backgroundColor: event.color || '#2b7fff',
                            color: 'white',
                            borderRadius: '5px',
                            border: 'none',
                            display: 'block',
                        },
                    };
                }}
                style={{ height: '100%', color: "#333" }}
                messages={{
                    next: 'Próximo',
                    previous: 'Anterior',
                    today: 'Hoje',
                    month: 'Mês',
                    week: 'Semana',
                    day: 'Dia',
                    agenda: 'Agenda',
                    date: 'Data',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'Nenhum evento neste período.',
                }}
            />
        </div>
    )
}
