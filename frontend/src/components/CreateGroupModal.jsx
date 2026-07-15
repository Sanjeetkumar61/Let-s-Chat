import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiUsers, FiX } from "react-icons/fi";
import { createGroup } from "../services/groupService";

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

const CreateGroupModal = ({ open, users = [], onClose, onGroupCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setSearch("");
      setSelectedMembers([]);
      setLoading(false);
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.success("Please enter group name.");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.success("Please select at least one member.");
      return;
    }

    try {
      setLoading(true);

      await createGroup({
        name,
        description,
        members: selectedMembers,
      });

      onGroupCreated?.();
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <FiUsers size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">
                Create Group
              </h2>
              <p className="text-[11px] text-slate-400">Add name and members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden space-y-3">
          <input
            type="text"
            placeholder="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm outline-none placeholder-slate-400 focus:bg-white focus:border-teal-400 transition"
          />

          <textarea
            rows={2}
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm resize-none outline-none placeholder-slate-400 focus:bg-white focus:border-teal-400 transition"
          />

          <div className="relative">
            <FiSearch
              className="absolute left-3 top-2.5 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm outline-none placeholder-slate-400 focus:bg-white focus:border-teal-400 transition"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs px-1 mb-1.5">
              <span className="font-semibold text-slate-600">Members</span>
              <span className="text-teal-600 font-bold">
                {selectedMembers.length} Selected
              </span>
            </div>

            <div className="border border-slate-100 rounded-lg max-h-48 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const checked = selectedMembers.includes(user._id);

                  return (
                    <label
                      key={user._id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 ${getAvatarBgColor(user._id || user.name, false)}`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <h3 className="text-xs font-semibold text-slate-700 truncate leading-snug">
                            {user.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(user._id)}
                        className="w-4 h-4 accent-teal-500 cursor-pointer flex-shrink-0 rounded"
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-3 flex justify-end gap-2 flex-shrink-0 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 text-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading || !name.trim() || selectedMembers.length === 0}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
