export const Emoji = {
	skull: String.fromCodePoint(0x1f480), // ๐
	tick: String.fromCodePoint(0x2705), // โ
	cross: String.fromCodePoint(0x274c), // โ
	warn: String.fromCodePoint(0x1f625), // ๐ฅ
	info: String.fromCodePoint(0x1f535), // ๐ต
	debug: String.fromCodePoint(0x1f41b), // ๐
	home: String.fromCodePoint(0x1f3e0), // ๐ 
	reload: String.fromCodePoint(0x231b), // โ
	flag: String.fromCodePoint(0x1f6a9), // ๐ฉ
	baby: String.fromCodePoint(0x1f476), // ๐ถ
	order: String.fromCodePoint(0x1f4e6), // ๐ฆ
	terminal: String.fromCodePoint(0x1f4b0), // ๐ฐ
	lab: String.fromCodePoint(0x1f52e), // ๐ฎ
	walk: String.fromCodePoint(0x1f45f), // ๐
	wait: String.fromCodePoint(0x1f6ac), // ๐ฌ
	module: String.fromCodePoint(0x26aa), // โช

	// Action
	attack_controller: String.fromCodePoint(0x1f680), // ๐
	avoiding: String.fromCodePoint(0x1f440), // ๐
	boosting: String.fromCodePoint(0x1f525), // ๐ฅ
	building: String.fromCodePoint(0x1f3d7), // ๐
	bulldozing: String.fromCodePoint(0x1f69c), // ๐
	charging: String.fromCodePoint(0x1f50c), // ๐
	claiming: String.fromCodePoint(0x26f3), // โณ
	defending: String.fromCodePoint(0x2694), // โ
	dismantling: String.fromCodePoint(0x26d1), // โ
	dropping: String.fromCodePoint(0x1f4a9), // ๐ฉ
	feeding: String.fromCodePoint(0x1f355), // ๐
	fortifying: String.fromCodePoint(0x1f6a7), // ๐ง
	fueling: String.fromCodePoint(0x26fd), // โฝ
	guarding: String.fromCodePoint(0x1f6e1), // ๐ก
	harvesting: String.fromCodePoint(0x26cf), // โ
	healing: String.fromCodePoint(0x1f48a), // ๐
	idle: String.fromCodePoint(0x1f3b5), // ๐ต
	invading: String.fromCodePoint(0x1f52b), // ๐ซ
	mining: String.fromCodePoint(0x26cf), // โ
	picking: String.fromCodePoint(0x1f9e4), // ๐งค
	reallocating: String.fromCodePoint(0x1f52e), // ๐ฎ
	recycling: String.fromCodePoint(0x1f504), // ๐
	repairing: String.fromCodePoint(0x1f527), // ๐ง
	reserving: String.fromCodePoint(0x1f6a9), // ๐ฉ
	robbing: String.fromCodePoint(0x1f47b), // ๐ป
	storing: String.fromCodePoint(0x23ec), // โฌ
	travelling: String.fromCodePoint(0x1f3c3), // ๐
	uncharging: String.fromCodePoint(0x1f50b), // ๐
	upgrading: String.fromCodePoint(0x1f64f), // ๐
	withdrawing: String.fromCodePoint(0x23eb), // โซ
	safegen: String.fromCodePoint(0x1f512), // ๐
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

โโโโโ                           โโโโโโโโโโ โโ โโโโโโโโโโ
โโโโโ                           โโโโโโโโโโโโโ โโโโโโโโโโ
โโโโโโโโโโโโโโโโโโโโโโโโโโโโ    โโโโโโโโโโโโโ โโโโ โโโโโ
โโโโโโโโโโโโโโโโโโโโโโโโโโโโฃ    โโโโโโโโโโ โโ โโโโ โโโโโ
โโโโโโโโโโโ โโโโฃโโโโฃโโโโโ โโโ    โโโโโโโโโโโโโโโโโโโโโโโโ
โโโโโโโโโโโ โโโโโโโโโโโโโโโโ    โโโโโโโโโโโโโโโโโโโโโโโโ
                    โโ
                    โโ
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




