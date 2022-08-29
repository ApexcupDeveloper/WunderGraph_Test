import { FunctionComponent, useState, useEffect } from "react";
import styles from "../../styles/section.module.css";
import { BsPlusCircleFill } from 'react-icons/bs';
import { CgMore } from 'react-icons/cg';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import Card from "./card";
import {
  GridDropZone,
  GridItem,
} from "react-grid-dnd";
import Modal from 'react-modal';

import { useMutation, withWunderGraph, useLiveQuery, useQuery } from '../../components/generated/nextjs'

Modal.setAppElement('#__next');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        background: '#373434',
        border: 'none',
        boxShadow: 'rgb(0 0 0 / 52%) 0px 0px 19px 0px',
        height: '600px',
        width: '500px'
    },

};

interface IProps {
  section: {
    id: number,
    title: string
  };
  orders: number[],
  orderId: number,
}

const Section: FunctionComponent<IProps> = ({ section, orders, orderId }) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editSection, setEditSection] = useState(false);
  const [sectionTitle, setSectoinTitle] = useState(section.title);
  const [selectedTask, setSelectedTask] = useState({ title: '', content: '' });
  const [showModal, setShowModal] = useState(false);

  const { mutate: createTask } = useMutation.CreateTask();
  const { result: tasks } = useLiveQuery.GetTasks({ input: { status: { equals: section.id } } });
  const { mutate: updateOrder } = useMutation.UpdateOrder();
  const { mutate: updateSection } = useMutation.UpdateSection();
  const { mutate: removeSection } = useMutation.DeleteSection();
  const { mutate: removeTask } = useMutation.DeleteTask();
  const { mutate: removeOrder } = useMutation.DeleteOrder();



  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const handleClick = (e) => {
    const specifiedElement = document.getElementById("moreModal" + section.id);
    const specifiedElement1 = document.getElementById("moreBtn" + section.id);
    if (specifiedElement) {
      const isClickInside = specifiedElement.contains(e.target);
      const clickMore = specifiedElement1.contains(e.target);

      if (clickMore) {
        setShowMore(true)
      } else if (!isClickInside) {
        setShowMore(false)
      }
    }
  }

  const addTask = () => {
    if (title.length === 0) {
      alert('Please input the task name');
      return
    }
    createTask({
      input: {
        title: title,
        content: content,
        status: section.id
      }
    }).then((res) => {
      if (res.status === "ok") {
        let newOrder = orders;
        newOrder.push(res.data.db_createOneTask.id);
        updateOrder({
          input: {
            id: orderId,
            order: { set: JSON.stringify(newOrder) }
          }
        });
        setContent('');
        setTitle('');
      }
    }).catch((err) => {
      console.log("err : ", err)
    })
  }

  const onRemove = () => {
    setShowMore(false);
    if (confirm("Are you sure you will remove this section?")) {
      orders.map((item) => {
        removeTask({
          input: {
            id: item
          }
        })
      })
      removeOrder({
        input: {
          id: section.id
        }
      })
      removeSection({
        input: {
          id: section.id
        }
      })
    }
  }

  const onSave = () => {
    if (!sectionTitle) {
      alert("Please input new section name.");
      return
    }
    if (sectionTitle === section.title) {
      setEditSection(false);
      return
    }
    updateSection({
      input: {
        id: section.id,
        title: { set: sectionTitle }
      }
    }).then((res) => {
      if (res.status === "ok") {
        setSectoinTitle(res.data.db_updateOneSection.title)
      }
    })
    setEditSection(false);
  }


  return (
    <div className={styles.section}>
      {editSection ? (
        <div className={styles.editMode}>
          <input className={styles.editInput} autoFocus value={sectionTitle} onChange={(e) => { setSectoinTitle(e.target.value) }} />
          <div className={styles.editTool}>
            <div onClick={onSave}>Save</div>
            <div onClick={() => { setSectoinTitle(section.title); setEditSection(false); }}>Cancel</div>
          </div>
        </div>
      ) : (
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            {section.title}
          </div>

          <div className={styles.sectionMore} id={"moreBtn" + section.id} onClick={() => { setShowMore(true); }}>
            <CgMore size={24} />
          </div>
        </div>
      )}
      {showMore && (
        <div className={styles.moreModal} id={"moreModal" + section.id}>
          <div className={styles.moreModalBtn} id="editBtn" onClick={() => { setShowMore(false); setEditSection(true); }}>
            <AiFillEdit size={20} style={{ marginRight: 10 }} />
            Edit Section
          </div>
          <div className={styles.moreModalBtn} id="delBtn" onClick={onRemove}>
            <AiFillDelete size={20} style={{ marginRight: 10 }} />
            Delete Section
          </div>
        </div>
      )}
      {showAddTask ? (
        <div className={styles.addTask}>
          <div className={styles.addTaskWrapper}>
            <input
              value={title}
              className={styles.addTaskTitle}
              placeholder="Task name"
              onChange={(e) => { setTitle(e.target.value) }}
            />
            <textarea
              value={content}
              className={styles.addTaskDescription}
              placeholder="Description"
              onChange={(e) => { setContent(e.target.value) }}
            />
          </div>
          <div className={styles.addTaskTool}>
            <div className={styles.cancelBtn} onClick={() => { setShowAddTask(false) }}>Cancel</div>
            <div className={styles.addBtn} onClick={addTask}>Add</div>
          </div>
        </div>
      ) : (
        <div className={styles.addTaskBtn} onClick={() => { setShowAddTask(true) }}>
          <BsPlusCircleFill color={'#098b8f'} size={20} style={{ marginRight: 10 }} />
          Add task
        </div>
      )}
      <div className={styles.sectoinBody}>
        <GridDropZone
          className={"dropzone " + section.id}
          id={section.id.toString()}
          boxesPerRow={1}
          rowHeight={80}
        >
          {tasks.status === "ok" && orders && orders.map((order, i) => {
            const task = tasks.data.db_findManyTask.filter((item) => item.id === order)[0]
            return (
              <GridItem key={'' + section.id + i} className="grid-item">
                <Card task={task} onClick={(title, content) => { setSelectedTask({ title: title, content: content }); setShowModal(true);  }} />
              </GridItem>
            )
          })}
        </GridDropZone>
      </div>
      <Modal
        isOpen={showModal}
        // onAfterOpen={afterOpenModal}
        onRequestClose={() => { setShowModal(false) }}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 style={{ color: 'white' }}>{selectedTask.title}</h2>
        <div style={{ color: 'white' }}>{selectedTask.content}</div>
      </Modal>
    </div>
  )
}

export default withWunderGraph(Section);
