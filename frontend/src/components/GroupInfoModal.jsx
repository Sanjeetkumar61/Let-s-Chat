import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { getGroup } from "../services/groupService";

const getAvatarBgColor = (id, isGroup) => {
  if (isGroup) return "bg-sky-500";

  const colors = [
    "bg-teal-600",
    "bg-emerald-600",
    "bg-violet-600",
    "bg-indigo-600",
    "bg-rose-600",
    "bg-orange-600",
    "bg-amber-600",
    "bg-pink-600",
    "bg-cyan-600",
    "bg-fuchsia-600",
  ];

  let hash = 0;
  const stringId = String(id || "");
  for (let i = 0; i < stringId.length; i++) {
    hash = stringId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const GroupInfoModal = ({ open, groupId, onClose }) => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !groupId) return;

    fetchGroup();
  }, [open, groupId]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const data = await getGroup(groupId);
      setGroup(data.group);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Sort members list to push the admin to the top position
  const sortedMembers = group?.members
    ? [...group.members].sort((a, b) => {
        const isAAdmin = group.admin?._id === a._id;
        const isBAdmin = group.admin?._id === b._id;
        if (isAAdmin && !isBAdmin) return -1;
        if (!isAAdmin && isBAdmin) return 1;
        return 0;
      })
    : [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <HiUserGroup size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">
                Group Info
              </h2>
              <p className="text-[11px] text-slate-400">
                View details and members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium">Loading details...</p>
            </div>
          ) : (
            group && (
              <>
                <div className="flex flex-col items-center text-center border-b border-slate-100 pb-4">
                  <div
                    className={`w-16 h-16 rounded-xl text-white flex items-center justify-center shadow-sm ${getAvatarBgColor(group._id, true)}`}
                  >
                    <HiUserGroup size={32} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mt-2.5">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                    {group.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-baseline px-0.5">
                    <span className="text-xs font-bold text-slate-600">
                      Members
                    </span>
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                      {group.members?.length || 0} Total
                    </span>
                  </div>

                  <div className="border border-slate-100 rounded-lg max-h-48 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {sortedMembers.map((member) => {
                      const isAdmin = group.admin?._id === member._id;
                      return (
                        <div
                          key={member._id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-none transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 ${getAvatarBgColor(member._id || member.name, false)}`}
                            >
                              {member.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs font-semibold text-slate-700 truncate leading-snug">
                                {member.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                                {member.email}
                              </p>
                            </div>
                          </div>

                          {isAdmin && (
                            <span className="text-[10px] font-bold bg-teal-500 text-white px-2 py-0.5 rounded-md flex-shrink-0">
                              Admin
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-400 font-medium">
                  <span>
                    Created on {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                  <span className="truncate max-w-[150px]">
                    By {group.admin?.name}
                  </span>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
