
-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'Hashtags'
-- 
-- ---

DROP TABLE IF EXISTS `hash_Hashtags`;
		
CREATE TABLE `hash_Hashtags` (
  `id` MEDIUMINT UNSIGNED NOT NULL,
  `name` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Table 'Tweets'
-- 
-- ---

DROP TABLE IF EXISTS `hash_Tweets`;

CREATE TABLE `hash_Tweets` (
    `tweetid` BIGINT UNSIGNED NOT NULL,
    `userid` INT UNSIGNED NOT NULL,
    `username` VARCHAR(20) NOT NULL,
    `text` VARCHAR(140) NOT NULL,
    `time` DATETIME NOT NULL,
    PRIMARY KEY(`tweetid`)
);

-- ---
-- Table 'Mentions'
-- 
-- ---

DROP TABLE IF EXISTS `hash_Mentions`;
		
CREATE TABLE `hash_Mentions` (
  `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tag` MEDIUMINT UNSIGNED NOT NULL,
  `tweet` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
);

-- ---
-- Foreign Keys 
-- ---

ALTER TABLE `hash_Mentions` ADD FOREIGN KEY (tag) REFERENCES `hash_Hashtags` (`id`);
ALTER TABLE `hash_Mentions` ADD FOREIGN KEY (tweet) REFERENCES `hash_Tweets` (`tweetid`);
CREATE INDEX time_index ON hash_Tweets(time);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `Hashtags` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Tweets` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Mentions` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `Hashtags` (`id`,`tag`,`tweet`) VALUES
-- ('','','');
-- INSERT INTO `Tweets` (`id`,`userid`,`username`,`text`,`time`) VALUES
-- ('','','','','');
-- INSERT INTO `Mentions` (`id`,`new field`) VALUES
-- ('','');

