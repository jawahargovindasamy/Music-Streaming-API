import User from "../Models/userModel.js";
import Song from "../Models/songModel.js";

export const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalUsers = await User.countDocuments({ role: "user" });

    const usersThisMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: firstDayOfCurrentMonth },
    });

    const usersLastMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: firstDayOfLastMonth, $lt: firstDayOfCurrentMonth },
    });

    let userGrowth = 0;
    if (usersLastMonth > 0) {
      userGrowth = ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;
    }

    const totalArtists = await User.countDocuments({ role: "artist" });

    const artistsThisMonth = await User.countDocuments({
      role: "artist",
      createdAt: { $gte: firstDayOfCurrentMonth },
    });

    const artistsLastMonth = await User.countDocuments({
      role: "artist",
      createdAt: { $gte: firstDayOfLastMonth, $lt: firstDayOfCurrentMonth },
    });

    let artistGrowth = 0;
    if (artistsLastMonth > 0) {
      artistGrowth = ((artistsThisMonth - artistsLastMonth) / artistsLastMonth) * 100;
    }

    const totalStreamsAgg = await Song.aggregate([
      {
        $group: {
          _id: null,
          totalPlays: { $sum: "$playCount" },
        },
      },
    ]);

    const totalStreams = totalStreamsAgg[0]?.totalPlays || 0;


    return res.status(200).json({
      message: "Admin stats fetched successfully",
      data: {
        totalUsers,
        usersThisMonth,
        usersLastMonth,
        userGrowth: userGrowth.toFixed(2),

        totalArtists,
        artistsThisMonth,
        artistsLastMonth,
        artistGrowth: artistGrowth.toFixed(2),

        totalStreams,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
