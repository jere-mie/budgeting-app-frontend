import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import TextInput from '../components/TextInput';
import layout from '../constants/Layout';
import Button from '../components/Button';

const CREATE_USER = (fname: string, lname: string, username: string, email: string, phone: string, password: string) => gql`
  mutation CREATE_USER {
    createUser(
      firstName: "${fname}",
      lastName: "${lname}",
      username: "${username}",
      email: "${email}",
      phoneNumber: "${phone}",
      password:"${password}"
    ){
      hashAuth
    }
  }
`;

export default function SignUpScreen({ navigation }: RootTabScreenProps<'SignUp'>) {

  const [username, setUsername] = useState("")
  const [fname, setFname] = useState("")
  const [lname, setLname] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [pwordConfirm, setPwordConfirm] = useState("")
  const [check, setCheck] = useState(false)
  const [pwordCheck, setPwordCheck] = useState(false)
  const [emailCheck, setEmailCheck] = useState(false)
  const [phoneCheck, setPhoneCheck] = useState(false)
  const [hidePword, setHidePword] = useState(true)

  // Create user graphql query
  const [createUser] = useMutation(CREATE_USER(fname, lname, username, email, phone, password), {
    onCompleted: (data => {
      data = data.createUser;
      navigation.navigate("SignIn");
    }),
    onError: (error => {
      Alert.alert("Something went wrong")
      console.log(error.message);
    })
  })

  const register = () => {
    setCheck(true);
    if (password && fname && username && email) {
      createUser();
    }
  }

  function RequiredField({ input }: { input: string }) {
    return (
      (!check || input) ? (
        <></>
      ) : (
        <Text style={styles.alert}>this field is required</Text>
      ))
  }

  function PasswordRules() {
    let lengthCheck = password.length >= 8;
    let lettersCheck = /([A-Z].?[a-z])|([a-z].?[A-Z])/.test(password);
    let numberCheck = /\d/.test(password);
    let specialCheck = /[^A-Za-z0-9]/.test(password);
    if (lettersCheck && lengthCheck && numberCheck && specialCheck) {
      return (<></>);
    }
    return (
      <View>
        <Text style={styles.reqs}>Password requirements:</Text>
        {lengthCheck ? (<></>) : (<Text style={styles.reqs}> - 8 characters minimum</Text>)}
        {lettersCheck ? (<></>) : (<Text style={styles.reqs}> - Upper and lower case letters</Text>)}
        {numberCheck ? (<></>) : (<Text style={styles.reqs}> - At least one number</Text>)}
        {specialCheck ? (<></>) : (<Text style={styles.reqs}> - At least one special character</Text>)}
      </View>
    )
  }

  function CheckEmail() {
    let emailRegex = /^[^/\\*;:,{}\[\]()$?]+@+[^/\\~`*;:,|{}\[\]=()%$?]+[.]{1}[^/\\~`*;:,|{}\[\]=()%$?]+$/;
    if (!emailCheck || !email || emailRegex.test(email)) {
      return (<></>);
    } else {
      return (
        <Text style={styles.alert}>Invalid email address</Text>
      )
    }
  }

  function CheckPhone() {
    let phoneRegex = /^[0-9]{7,15}$/;
    if (!phoneCheck || !phone || phoneRegex.test(phone)) {
      return (<></>);
    } else {
      return (
        <Text style={styles.alert}>Invalid phone number</Text>
      )
    }
  }

  function FormatPhone(newPhone: string) {
    let phoneArray = newPhone.substring(1).replaceAll(/[^0-9]/g, "");
    setPhone(phoneArray);
    setPhoneCheck(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Account</Text>
      <ScrollView style={styles.separator}>
        <TextInput
          style={styles.formField}
          onChangeText={(fname) => setFname(fname)}
          value={fname}
          placeholder="First Name*"
        />
        <RequiredField input={fname} />
        <TextInput
          style={styles.formField}
          onChangeText={(lname) => setLname(lname)}
          value={lname}
          placeholder="Last Name"
        />
        <TextInput
          style={styles.formField}
          onChangeText={(username) => setUsername(username)}
          value={username}
          placeholder="Username*"
        />
        <RequiredField input={username} />
        <TextInput
          style={styles.formField}
          onChangeText={(email) => { setEmail(email.replaceAll(/\s+/g, "")); setEmailCheck(false) }}
          onBlur={() => setEmailCheck(true)}
          value={email}
          placeholder="Email*"
        />
        <CheckEmail />
        <RequiredField input={email} />
        <View style={styles.formField}>
          <TextInput
            style={styles.pwordinput}
            onChangeText={(password) => setPassword(password)}
            value={password}
            secureTextEntry={hidePword}
            placeholder="Password*"
          />
          <FontAwesome style={styles.icon} name={hidePword ? ("eye") : ("eye-slash")} size={layout.signUpScreen.eyeIconSize} onPress={() => setHidePword(!hidePword)} />
        </View>
        <RequiredField input={password} />
        <PasswordRules />
        <TextInput
          style={styles.formField}
          onChangeText={(pword) => { setPwordConfirm(pword); setPwordCheck(false) }}
          onBlur={() => setPwordCheck(true)}
          value={pwordConfirm}
          secureTextEntry={hidePword}
          placeholder="Confirm Password*"
        />
        {(!pwordCheck || (pwordConfirm === password)) ? (
          <RequiredField input={pwordConfirm} />
        ) : (
          (<Text style={styles.alert}>password fields need to match</Text>)
        )}
        <TextInput
          style={styles.formField}
          onChangeText={(newPhone) => FormatPhone(newPhone)}
          onBlur={() => setPhoneCheck(true)}
          value={'+' + phone}
          keyboardType="phone-pad"
          placeholder="Phone Number"
        />
        <CheckPhone />
        <Button
          onPress={() => register()}
          text="Sign Up"
        // Uncomment accessibiliyt label when Button changes are merged.
        // accessibilityLabel="Sign Up Button"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingTop: 20,
    fontSize: 32,
    // Not a system font on Android
    // fontFamily: 'Gill Sans MT', 
    marginHorizontal: 25,
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
  },
  alert: {
    color: 'red',
    marginHorizontal: 5,
    marginBottom: 8,
  },
  reqs: {
    color: 'gray',
    fontSize: 14,
    marginHorizontal: 5,
    marginBottom: 1,
  },
  formField: {
    marginVertical: 7,
  },
  icon: {
    position: 'absolute',
    right: layout.signUpScreen.eyeIconMarginRight,
    top: '50%',
    transform: [{ translateY: -(layout.signUpScreen.eyeIconSize) / 2 }],
  },
  pwordinput: {
    paddingRight: 20 + layout.signUpScreen.eyeIconMarginRight,
  }
});
