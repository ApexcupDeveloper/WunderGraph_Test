import { FunctionComponent } from "react";
import styles from "../../styles/card.module.css";
import { CgMore } from 'react-icons/cg';

interface IProps {
    task: {
      id: number,
      title: string,
      content: string
    };
    onClick: (title: string, content: string) => void
}

const Card: FunctionComponent<IProps> = ({ task, onClick }) => {
    return (
        <div className={styles.sectionTask} onDoubleClick={(e) => { onClick(task.title, task.content)}}>
            <div className={styles.sectionTaskMore} onClick={(e) => { e.stopPropagation(); alert("This function is not added because currently CRUD is implemented already.") }}>
                <CgMore size={16} />
            </div>
            <div>
              {task ? task.title : ''}
            </div>
            <label style={{ fontSize: 12 }}>{task ? task.content.substring(0, 70).concat("...") : ''}</label>
        </div>
    )
}

export default Card;
