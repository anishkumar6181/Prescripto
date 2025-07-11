import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import Chat from "../components/Chat";

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [paidAppointmentId, setPaidAppointmentId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // const appointmentRazorpay = async (appointmentId) => {
  //   console.log("Pay Online button clicked", appointmentId);
  //   try {
  //     const { data } = await axios.post(
  //       backendUrl + "/api/user/payment-razorpay",
  //       { appointmentId },
  //       { headers: { token } }
  //     );
  //     console.log("API response:", data);

  //     if (data.success) {
  //       console.log("Order data:", data.order);
  //     } else {
  //       console.log("API error:", data.message || "Unknown error"); // Handle undefined message
  //       toast.error(data.message || "Unknown error");
  //     }
  //   } catch (error) {
  //     console.log("Request error:", error);
  //     toast.error(error.message);
  //   }
  // };
  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>

      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={item.docData.image}
                alt=""
              />
            </div>

            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-sm mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>{" "}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>

            <div></div>

            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled &&
                paidAppointmentId === item._id &&
                !item.isCompleted && (
                  <button className="text-stone-500 sm:min-w-48 py-2 border rounded bg-green-100">
                    Paid
                  </button>
                )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => handlePayment(item._id)}
                  className="text-sm text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Pay
                </button>
              )}
              {/* {showSuccess && <p className='text-green-500'>Payment successful!</p>} */}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel Appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment Cancelled
                </button>
              )}
              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                  Appointment Completed
                </button>
              )}
              {/* // Add to each appointment */}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => setActiveChat(item)}
                  className="text-sm text-stone-500 sm:min-w-48 py-2 border rounded hover:bg-blue-500 hover:text-white transition-all duration-300"
                >
                  Chat with Doctor
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Chat with Dr. {activeChat.docData.name}
              </h3>
              <button
                onClick={() => setActiveChat(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <Chat
              appointmentId={activeChat._id}
              doctorId={activeChat.docData._id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
//     </div>
//   );
// };

// export default MyAppointments;
