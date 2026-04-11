import ButtonComponent from "@/components/ButtonComponent";
import CheckBox from "@/components/Checkbox";
import Dropdown from "@/components/Dropdown";
import Page from "@/components/Page";
import SwipeModal from "@/components/SwipeModal";
import TextInputComponent from "@/components/TextInputComponent";
import { Colors, Profile, Time } from "@/constants/enums";
import { textColor } from "@/constants/functions";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import { Entypo, MaterialIcons, Octicons } from "@expo/vector-icons";
import { Fragment, useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";

export default function Times() {
  const [profile, setProfile] = useState<Profile | null>({} as Profile);
  const [mainSwimmerSelected, setMainSwimmerSelected] = useState(true);
  const [timesInputted, setTimesInputted] = useState(false);
  const colorScheme = useColorScheme();
  const [inputTimeModalVisible, setInputTimeModalVisible] = useState(false);

  useEffect(() => {
    const asyncer = async () => {
      const profile = await TeamBBZSQLite.db.getFirstAsync<Profile>(
        "SELECT * FROM profile",
      );
      setProfile(profile);
      setMainSwimmerSelected(true);
      setTimesInputted(
        !!(await TeamBBZSQLite.db.getFirstAsync<Time>("SELECT * FROM times")),
      );
    };
    asyncer();
  }, []);

  if (profile) {
    return (
      <Page>
        <InputTimesModal
          onClose={() => setInputTimeModalVisible(false)}
          visible={inputTimeModalVisible}
          currentSwimmer={profile.username}
        />
        <TimesHeader
          profile={profile}
          mainSwimmerSelected={mainSwimmerSelected}
          timesInputted={timesInputted}
        />
        {timesInputted ? (
          <ButtonComponent
            onPress={() => setInputTimeModalVisible(true)}
            style={{ width: "95%", paddingVertical: 10, marginVertical: 10 }}
          >
            <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
              Voer tijden in
            </Text>
          </ButtonComponent>
        ) : (
          <Fragment>
            <Text
              style={{
                color: "grey",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              Je moet ten minste 1 tijd invullen om verder te kunnen gaan!
            </Text>
            <ButtonComponent
              onPress={() => setInputTimeModalVisible(true)}
              style={{ width: "95%", paddingVertical: 10, marginVertical: 10 }}
            >
              <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                Voer tijden in
              </Text>
            </ButtonComponent>
          </Fragment>
        )}
      </Page>
    );
  } else return <Page></Page>;
}

function InputTimesModal({
  visible,
  onClose,
  currentSwimmer,
}: {
  visible: boolean;
  onClose: () => void;
  currentSwimmer: string;
}) {
  const colorScheme = useColorScheme();
  const [selectedStroke, setSelectedStroke] = useState<
    "Vlinderslag" | "Rugslag" | "Schoolslag" | "Vrije Slag" | "Wisselslag"
  >("Vlinderslag");
  const [distance, setDistance] = useState<
    25 | 50 | 100 | 200 | 300 | 400 | 800 | 1500 | 2000
  >(25);
  const [time, setTime] = useState<Time>({ poolSize: "25m" } as Time);

  return (
    <SwipeModal
      visible={visible}
      onClose={() => {
        onClose();
        setSelectedStroke("Vlinderslag");
      }}
      height={Dimensions.get("window").height}
    >
      <ScrollView>
        <View
          style={{
            flex: 1,
            justifyContent: "space-evenly",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <Dropdown
            data={
              selectedStroke === "Vrije Slag"
                ? [
                    "25m",
                    "50m",
                    "100m",
                    "200m",
                    "400m",
                    "800m",
                    "1500m",
                    "2000m",
                  ]
                : selectedStroke === "Wisselslag"
                  ? ["100m", "200m", "300m", "400m"]
                  : ["25m", "50m", "100m", "200m"]
            }
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "grey",
                  borderRadius: 6,
                  padding: 5,
                  marginVertical: 5,
                }}
              >
                <Text style={[textColor(colorScheme)]}>{item}</Text>
              </View>
            )}
            style={{ width: "35%" }}
            textStyle={{ width: "70%" }}
            closeWhenSelected
            onPress={(item) =>
              setDistance(
                parseInt(item) as
                  | 50
                  | 100
                  | 200
                  | 300
                  | 400
                  | 800
                  | 1500
                  | 2000,
              )
            }
          />
          <Dropdown
            data={[
              "Vlinderslag",
              "Rugslag",
              "Schoolslag",
              "Vrije Slag",
              "Wisselslag",
            ]}
            renderItem={({ item }) => (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "grey",
                  borderRadius: 6,
                  padding: 5,
                  marginVertical: 5,
                }}
              >
                <Text style={[textColor(colorScheme)]}>{item}</Text>
              </View>
            )}
            style={{ width: "45%" }}
            textStyle={{ width: "82%" }}
            onPress={(item) => setSelectedStroke(item)}
            closeWhenSelected
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginVertical: 10,
            alignItems: "flex-end",
            paddingHorizontal: 40,
          }}
        >
          <TextInputComponent
            placeholder="m"
            keyboardType="numeric"
            style={{ width: 50, textAlign: "center" }}
          />
          <Text
            style={[
              textColor(colorScheme),
              { fontSize: 35, fontWeight: "bold" },
            ]}
          >
            :
          </Text>
          <TextInputComponent
            placeholder="s"
            keyboardType="numeric"
            style={{ width: 50, textAlign: "center" }}
          />
          <Text
            style={[
              textColor(colorScheme),
              { fontSize: 35, fontWeight: "bold" },
            ]}
          >
            .
          </Text>
          <TextInputComponent
            placeholder="h"
            keyboardType="numeric"
            style={{ width: 50, textAlign: "center" }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Kort bad (25m)</Text>
          <CheckBox
            onPress={() =>
              setTime({
                ...time,
                poolSize: time.poolSize === "25m" ? "50m" : "25m",
              })
            }
            checked={time.poolSize === "25m"}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={[textColor(colorScheme)]}>FINA Punten</Text>
          <TextInputComponent
            keyboardType="numeric"
            style={{ width: 50, textAlign: "center" }}
          />
        </View>
        <View
          style={{
            alignItems: "center",
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 25,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Zwemmer</Text>
          <TextInputComponent
            placeholder="Zwemmer"
            style={{ width: 150, textAlign: "center" }}
            value={currentSwimmer}
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Datum (dd-mm-yyyy)"
            style={{ width: 250, textAlign: "center" }}
            keyboardType="numeric"
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Wedstrijd"
            style={{ width: 250, textAlign: "center" }}
          />
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TextInputComponent
            placeholder="Locatie"
            style={{ width: 250, textAlign: "center" }}
          />
        </View>
      </ScrollView>
    </SwipeModal>
  );
}

enum Tabs {
  Input = 1,
  Pbs = 2,
  Records = 3,
  Meets = 4,
  Biografy = 5,
  Speciality = 6,
}

function TimesHeader({
  mainSwimmerSelected,
  profile,
  timesInputted,
}: {
  mainSwimmerSelected: boolean;
  profile: Profile;
  timesInputted: boolean;
}) {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState(
    !timesInputted ? Tabs.Input : Tabs.Pbs,
  );
  useEffect(() => {
    setActiveTab(!timesInputted ? Tabs.Input : Tabs.Pbs);
  }, [timesInputted]);
  return (
    <View
      style={{
        backgroundColor:
          colorScheme === "light" ? "#fff" : Colors.DarkBackground,
        zIndex: 2,
        height: 130,
        position: "absolute",
        top: 0,
      }}
    >
      <Pressable
        style={{
          width: "100%",
          paddingVertical: 5,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flexDirection: "column",
            flex: 1,
            width: "90%",
            marginVertical: 10,
            borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
            borderWidth: 1,
            borderRadius: 6,
            paddingHorizontal: 20,
            paddingVertical: 5,
          }}
        >
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
              {profile.username}
            </Text>
            <Text style={[textColor(colorScheme)]}>{profile.birthdate}</Text>
          </View>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
              {profile.country}
            </Text>
            <Text style={[textColor(colorScheme)]}>{profile.club}</Text>
          </View>
        </View>
      </Pressable>

      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: "grey",
          width: Dimensions.get("window").width,
          flex: 1,
          justifyContent: "space-around",
          paddingBottom: 5,
        }}
      >
        <Fragment>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Input ? 2 : 1,
              borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
            }}
            onPress={() => setActiveTab(Tabs.Input)}
          >
            <MaterialIcons
              name="input"
              color={textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Pbs ? 2 : 1,
              borderColor: !timesInputted
                ? "grey"
                : mainSwimmerSelected
                  ? Colors.Orange
                  : Colors.Blue,
            }}
            onPress={() => (!timesInputted ? null : setActiveTab(Tabs.Pbs))}
          >
            <Octicons
              name="stopwatch"
              color={!timesInputted ? "grey" : textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
          <ButtonComponent
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: activeTab === Tabs.Speciality ? 2 : 1,
              borderColor: !timesInputted
                ? "grey"
                : mainSwimmerSelected
                  ? Colors.Orange
                  : Colors.Blue,
            }}
            onPress={() =>
              !timesInputted ? null : setActiveTab(Tabs.Speciality)
            }
          >
            <Octicons
              name="star"
              color={!timesInputted ? "grey" : textColor(colorScheme).color}
              size={20}
            />
          </ButtonComponent>
        </Fragment>
      </View>
    </View>
  );
}
