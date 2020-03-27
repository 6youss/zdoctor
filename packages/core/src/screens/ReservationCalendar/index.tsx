import React from "react";
import { Text, Alert, View } from "react-native";

import { ScreenContainer, Touchable, Avatar } from "../../components";

import styles from "./styles";
import SessionPicker from "../../components/SessionPicker";
import { ZTime } from "../../utils/ztime";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { doctorSelector, patientSelector, tokenSelector, sessionsSelector } from "../../redux/selectors";
import { postSession, getDoctorSessions } from "../../api/sessions";
import { getDateFromString, addDays } from "../../utils/zdate";
import { setSearchedDoctorSessionsAction } from "../../redux/actions/sessionsActions";
import { Colors, bigShadow } from "../../utils/values";
import GoBack from "../../components/GoBack";
import { fetchDoctorByPhone } from "../../api/doctor";
import { setDoctorAction } from "../../redux/actions/doctorActions";
import { RouteComponentProps } from "react-router";

const ReserveSession: React.FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const patient = useSelector(patientSelector);
  const doctor = useSelector(doctorSelector, shallowEqual);
  const sessions = useSelector(sessionsSelector, shallowEqual);
  const accessToken = useSelector(tokenSelector);
  const [currentDay, setCurrentDay] = React.useState<Date>(new Date());

  React.useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const sessions = await getDoctorSessions(accessToken, doctor._id);
      dispatch(setSearchedDoctorSessionsAction(sessions));
      const doctorDetails = await fetchDoctorByPhone(doctor.phone);
      dispatch(setDoctorAction(doctorDetails));
    } catch (error) {
      Alert.alert("Oops!", error.message);
    }
  }

  function handleRightPress() {
    setCurrentDay(addDays(currentDay, 3));
  }
  function handleLeftPress() {
    setCurrentDay(addDays(currentDay, -3));
  }

  function handleHourPress(date: Date, time: ZTime) {
    Alert.alert("Prendre rendez vous", `Confirmer la prise du rendez-vous le ${date} à ${time.toString()} ?`, [
      {
        text: "Confirmer",
        onPress: () => {
          postSession(accessToken, patient._id, doctor._id, date)
            .then(session => {
              fetchSessions();
              Alert.alert("Success", `session prise avec succes`);
            })
            .catch(error => {
              Alert.alert("Oops!", error.message);
            });
        }
      },
      { text: "Annuler" }
    ]);
  }

  return (
    <ScreenContainer
      status={{ backgroundColor: Colors.white, barStyle: "dark-content" }}
      safeArea={{ style: { backgroundColor: Colors.white } }}
    >
      <View style={{ marginHorizontal: 20, marginTop: 15, marginBottom: 15 }}>
        <GoBack
          onPress={() => {
            history.goBack();
          }}
        >
          <Text style={styles.headerText}>
            <Text style={{ fontWeight: "100" }}>{`Visite chez `}</Text>
            {`Pr. ${doctor.firstName} ${doctor.lastName}`}
          </Text>
          <Touchable
            shadow
            borderRadius={30}
            onPress={() => {
              history.push("/PatientProfile");
            }}
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Avatar radius={35} style={{ margin: 5 }} />
          </Touchable>
        </GoBack>
      </View>
      <View
        style={{
          flexGrow: 1,
          marginHorizontal: 20,
          ...bigShadow
        }}
      >
        <View style={[styles.pickerContainer, { elevation: bigShadow.elevation }]}>
          <SessionPicker
            filterMode="available"
            currentDate={currentDay}
            onHourPress={handleHourPress}
            dayCount={3}
            unavailablitites={doctor.unavailablities}
            workingHours={doctor.workingHours}
            sessionDurations={doctor.sessionDurations}
            allreadyTakenHours={sessions}
            onArrowLeftPress={handleLeftPress}
            onArrowRightPress={handleRightPress}
            onRefresh={fetchSessions}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default ReserveSession;
