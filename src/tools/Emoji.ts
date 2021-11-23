export const Emoji = {
	skull: String.fromCodePoint(0x1f480), // 💀
	tick: String.fromCodePoint(0x2705), // ✅
	cross: String.fromCodePoint(0x274c), // ❌
	warn: String.fromCodePoint(0x1f625), // 😥
	info: String.fromCodePoint(0x1f535), // 🔵
	debug: String.fromCodePoint(0x1f41b), // 🐛
	home: String.fromCodePoint(0x1f3e0), // 🏠
	reload: String.fromCodePoint(0x231b), // ⌛
	flag: String.fromCodePoint(0x1f6a9), // 🚩
	baby: String.fromCodePoint(0x1f476), // 👶
	order: String.fromCodePoint(0x1f4e6), // 📦
	terminal: String.fromCodePoint(0x1f4b0), // 💰
	lab: String.fromCodePoint(0x1f52e), // 🔮
	walk: String.fromCodePoint(0x1f45f), // 👟
	wait: String.fromCodePoint(0x1f6ac), // 🚬
	module: String.fromCodePoint(0x26aa), // ⚪

	// Action
	attack_controller: String.fromCodePoint(0x1f680), // 🚀
	avoiding: String.fromCodePoint(0x1f440), // 👀
	boosting: String.fromCodePoint(0x1f525), // 🔥
	building: String.fromCodePoint(0x1f3d7), // 🏗
	bulldozing: String.fromCodePoint(0x1f69c), // 🚜
	charging: String.fromCodePoint(0x1f50c), // 🔌
	claiming: String.fromCodePoint(0x26f3), // ⛳
	defending: String.fromCodePoint(0x2694), // ⚔
	dismantling: String.fromCodePoint(0x26d1), // ⛑
	dropping: String.fromCodePoint(0x1f4a9), // 💩
	feeding: String.fromCodePoint(0x1f355), // 🍕
	fortifying: String.fromCodePoint(0x1f6a7), // 🚧
	fueling: String.fromCodePoint(0x26fd), // ⛽
	guarding: String.fromCodePoint(0x1f6e1), // 🛡
	harvesting: String.fromCodePoint(0x26cf), // ⛏
	healing: String.fromCodePoint(0x1f48a), // 💊
	idle: String.fromCodePoint(0x1f3b5), // 🎵
	invading: String.fromCodePoint(0x1f52b), // 🔫
	mining: String.fromCodePoint(0x26cf), // ⛏
	picking: String.fromCodePoint(0x1f9e4), // 🧤
	reallocating: String.fromCodePoint(0x1f52e), // 🔮
	recycling: String.fromCodePoint(0x1f504), // 🔄
	repairing: String.fromCodePoint(0x1f527), // 🔧
	reserving: String.fromCodePoint(0x1f6a9), // 🚩
	robbing: String.fromCodePoint(0x1f47b), // 👻
	storing: String.fromCodePoint(0x23ec), // ⏬
	travelling: String.fromCodePoint(0x1f3c3), // 🏃
	uncharging: String.fromCodePoint(0x1f50b), // 🔋
	upgrading: String.fromCodePoint(0x1f64f), // 🙏
	withdrawing: String.fromCodePoint(0x23eb), // ⏫
	safegen: String.fromCodePoint(0x1f512), // 🔒
};

export const Splash = () => {
	try {
		const version = `[VI]{version}[/VI]`;
		const date = `[VI]{date}[/VI]`;
		  if (!Memory.version || Memory.version !== version) {
			Memory.version = version;
		  }
		  if (!Memory.date || Memory.date !== date) {
			Memory.date = date;
		  }
		} catch (error) {
		console.log(error);
	  }

	console.log(`<p style="color:#AE81FF">

╔═══╗                           ╔═══╗╔═══╗ ╔╗ ╔╗╔═╗╔═══╗
║╔═╗║                           ║╔═╗║║╔═╗║╔╝║ ║║║╔╝║╔═╗║
║╚══╗╔══╗╔═╗╔══╗╔══╗╔══╗╔══╗    ║╚══╗╚╝╔╝║╚╗║ ║╚╝╝ ╚╝╔╝║
╚══╗║║╔═╝║╔╝║╔╗║║╔╗║║╔╗║║══╣    ╚══╗║╔═╝╔╝ ║║ ║╔╗║ ╔╗╚╗║
║╚═╝║║╚═╗║║ ║║═╣║║═╣║╚╝║╠══║    ║╚═╝║║║╚═╗╔╝╚╗║║║╚╗║╚═╝║
╚═══╝╚══╝╚╝ ╚══╝╚══╝║╔═╝╚══╝    ╚═══╝╚═══╝╚══╝╚╝╚═╝╚═══╝
                    ║║
                    ╚╝
=========================================================
= Version: ${Memory.version}  BuildDate: ${Memory.date} =
=========================================================
</p>
`);
};
/**
 _____ _____ _____ _____ _____ _____ _____    _____    __ _____ _____
|   __|     | __  |   __|   __|  _  |   __|  |     |__|  | __  |  |  |
|__   |   --|    -|   __|   __|   __|__   |  |  |  |  |  | __ -|    -|
|_____|_____|__|__|_____|_____|__|  |_____|  |_____|_____|_____|__|__|
*/




