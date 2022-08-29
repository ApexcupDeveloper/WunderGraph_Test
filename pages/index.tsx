import styles from '../styles/Home.module.css'
import { FunctionComponent, useState, useEffect } from 'react'
import Head from 'next/head'
import { FaPlusSquare } from 'react-icons/fa';
import Section from '../components/app-components/section'
import {
  GridContextProvider,
  swap,
  move
} from "react-grid-dnd";
import { useMutation, useQuery, useLiveQuery, withWunderGraph } from '../components/generated/nextjs'

interface IProps {
}

const Home: FunctionComponent<IProps> = ({ }) => {
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [orders, setOrders] = useState({})

  const { mutate: createSection } = useMutation.CreateSection();
  const { mutate: createOrder } = useMutation.CreateOrder();
  const { mutate: updateOrder } = useMutation.UpdateOrder();
  const { mutate: updateTask } = useMutation.UpdateTask();
  const { result: sections } = useLiveQuery.GetSections();
  const { result: order } = useLiveQuery.GetAllOrders()

  useEffect(() => {
    if (order.status === "ok" && order.data.db_findManyOrder.length) {
      let temp = {};
      order.data.db_findManyOrder.forEach((item) => {
        temp[item.id] = JSON.parse(item.order)
      })
      setOrders(temp);
    }
  }, [order])

  const addNewSection = () => {
    if (newSectionTitle.length === 0) {
      alert("Please input section name");
      return;
    }

    createSection({
      input: {
        title: newSectionTitle
      }
    }).then((res) => {
      if (res.status === "ok") {
        createOrder({
          input: {
            id: res.data.db_createOneSection.id,
            order: JSON.stringify([])
          }
        })
        setNewSectionTitle("");
        setShowAddSection(false);
      }
    });
  }

  const onChange = (sourceId, sourceIndex, targetIndex, targetId) => {
    if (targetId) {
     const result = move(
       orders[sourceId],
       orders[targetId],
       sourceIndex,
       targetIndex
     );

     const newOrder = {
       ...orders,
       [sourceId]: result[0],
       [targetId]: result[1]
     };

     updateTask({
       input: {
         id: orders[sourceId][sourceIndex],
         status: { set: Number(targetId) }
       }
     })
     updateOrder({
       input: {
         id: Number(sourceId),
         order: { set: JSON.stringify(result[0]) }
       }
     })
     updateOrder({
       input: {
         id: Number(targetId),
         order: { set: JSON.stringify(result[1]) }
       }
     })
     return setOrders(newOrder)
   }

   const result = swap(orders[sourceId], sourceIndex, targetIndex);

   updateOrder({
     input: {
       id: Number(sourceId),
       order: { set: JSON.stringify(result) }
     }
   })
   return setOrders({
     ...orders,
     [sourceId]: result
   });
  }

  return (
    <div className={styles.body}>
      <Head>
        <title>Home</title>
      </Head>
      <div className={styles.header}>
      Todo List
      <p style={{ fontSize: 12, margin: 3 }}>Please drag and drop to update card status</p>
      <p style={{ fontSize: 12, margin: 3 }}>Double click to see the card details</p>
      </div>
      <div className={styles.container}>
        <GridContextProvider onChange={onChange}>
          <div className={styles.sectionContainer}>
            {
              sections.status === "ok" && sections.data.db_findManySection.map((section, i) => {
                const temp = orders ? orders[section.id] : []
                return (
                  <Section
                    section={{ id: section.id, title: section.title }}
                    key={i}
                    orders={temp}
                    orderId={section.id}
                  />
                )
              })
            }
            {showAddSection ? (
              <div className={styles.addSection}>
                <input
                  className={styles.addSectionInput}
                  placeholder='Name of the section'
                  value={newSectionTitle}
                  onChange={(e) => { setNewSectionTitle(e.target.value) }}
                />
                <div className={styles.addSectionTools}>
                  <div className={styles.addBtn} onClick={addNewSection}>Add</div>
                  <div className={styles.closeBtn} onClick={() => { setShowAddSection(false) }}>Close</div>
                </div>
              </div>
            ) : (
              <div className={styles.addSectionBtn} onClick={() => { setShowAddSection(true) }}>
                <FaPlusSquare style={{ marginRight: 10 }} />
                Add section
              </div>
            )}


          </div>
        </GridContextProvider>
      </div>
    </div>
  )
}

export default withWunderGraph(Home);
