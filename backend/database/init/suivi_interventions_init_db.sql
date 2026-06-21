
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `suivi_interventions_db`

CREATE DATABASE IF NOT EXISTS suivi_interventions_db;
USE suivi_interventions_db;
--

-- --------------------------------------------------------

-- Creation of Database admin

CREATE USER 'admin'@'%' IDENTIFIED BY 'admin';

GRANT ALL privileges ON suivi_interventions_db.* TO 'admin'@'%';


--
-- Table structure for table `demande`
--

CREATE TABLE IF NOT EXISTS `demande` (
  `idDemande` int(11) NOT NULL,
  `nomMateriel` varchar(30) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `dateDemande` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `idUtilisateur` int(11) DEFAULT NULL,
  `statusDemande` enum('Pending','In Progress','Done') DEFAULT 'Pending',
  `imageUrl` text NOT NULL,
  `imageId` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `intervention`
--

CREATE TABLE IF NOT EXISTS `intervention` (
  `idIntervention` int(11) NOT NULL,
  `dateIntervention` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` text DEFAULT NULL,
  `idDemande` int(11) DEFAULT NULL,
  `technicienNom` varchar(20) DEFAULT NULL,
  `technicienPrenom` varchar(20) DEFAULT NULL,
  `technicienTel` varchar(10) DEFAULT NULL,
  `statusIntervention` enum('Pending','Completed') DEFAULT 'Pending',
  `technicienCost` int(11) NOT NULL,
  `totalCost` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `piece`
--

CREATE TABLE IF NOT EXISTS `piece` (
  `idPiece` int(11) NOT NULL,
  `nomPiece` varchar(20) DEFAULT NULL,
  `quantite` int(11) DEFAULT NULL,
  `idIntervention` int(11) DEFAULT NULL,
  `unitPrice` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `utilisateur`
--

CREATE TABLE IF NOT EXISTS `utilisateur` (
  `id` int(11) NOT NULL,
  `nom` varchar(20) DEFAULT NULL,
  `prenom` varchar(20) DEFAULT NULL,
  `tel` varchar(10) DEFAULT NULL,
  `departement` varchar(20) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  `motDePasse` text DEFAULT NULL,
  `role` enum('Admin','Employee') DEFAULT NULL,
  `firstLogin` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



--
-- Indexes for table `demande`
--
ALTER TABLE `demande`
  ADD PRIMARY KEY (`idDemande`),
  ADD KEY `demande_ibfk_1` (`idUtilisateur`);

--
-- Indexes for table `intervention`
--
ALTER TABLE `intervention`
  ADD PRIMARY KEY (`idIntervention`),
  ADD KEY `intervention_ibfk_1` (`idDemande`);

--
-- Indexes for table `piece`
--
ALTER TABLE `piece`
  ADD PRIMARY KEY (`idPiece`),
  ADD KEY `piece_ibfk_2` (`idIntervention`);

--
-- Indexes for table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `demande`
--
ALTER TABLE `demande`
  MODIFY `idDemande` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `intervention`
--
ALTER TABLE `intervention`
  MODIFY `idIntervention` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `piece`
--
ALTER TABLE `piece`
  MODIFY `idPiece` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `demande`
--
ALTER TABLE `demande`
  ADD CONSTRAINT `demande_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `intervention`
--
ALTER TABLE `intervention`
  ADD CONSTRAINT `intervention_ibfk_1` FOREIGN KEY (`idDemande`) REFERENCES `demande` (`idDemande`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `piece`
--
ALTER TABLE `piece`
  ADD CONSTRAINT `piece_ibfk_2` FOREIGN KEY (`idIntervention`) REFERENCES `intervention` (`idIntervention`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
